package com.pictora.backend.service;

import com.pictora.backend.entity.Folder;
import com.pictora.backend.entity.Image;
import com.pictora.backend.repository.FolderRepository;
import com.pictora.backend.repository.ImageRepository;
import com.pictora.backend.repository.PostRepository;
import com.pictora.backend.repository.UserAccountRepository;

import jakarta.persistence.EntityNotFoundException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;
import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;
import java.io.*;
import java.util.*;
import java.util.stream.Stream;

@Service
public class ImageService {

    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;
    private static final int MAX_DIMENSION = 10_000;
    private static final long MAX_PIXELS = 40_000_000L;
    private static final int THUMBNAIL_SIZE = 400;

    private final ImageRepository imageRepository;
    private final FolderRepository folderRepository;
    private final UserAccountRepository userRepository;
    private final FileStorageService storage;

    public ImageService(
            ImageRepository imageRepository,
            FolderRepository folderRepository,
            PostRepository postRepository,
            UserAccountRepository userRepository,
            FileStorageService storage
    ) {
        this.imageRepository = imageRepository;
        this.folderRepository = folderRepository;
        this.userRepository = userRepository;
        this.storage = storage;
    }

    public Image uploadImage(UUID userId, MultipartFile file, UUID folderId) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Maximum file size is 20 MB.");
        }

        byte[] bytes = file.getBytes();

        DecodedImage decoded;
        try {
            decoded = decode(bytes);
        } catch (IOException exception) {
            throw new IllegalArgumentException("Invalid or unsupported image.", exception);
        }

        Folder folder = findOwnedFolder(folderId, userId);
        byte[] thumbnail = createThumbnail(decoded.image());

        UUID objectId = UUID.randomUUID();
        String storageKey = "images/" + userId + "/" + objectId + "." + extension(decoded.format());
        String thumbnailKey = "thumbnails/" + userId + "/" + objectId + ".jpg";

        List<String> stored = new ArrayList<>();

        try {
            storage.store(new ByteArrayInputStream(bytes), bytes.length,
                    contentType(decoded.format()), storageKey);
            stored.add(storageKey);

            storage.store(new ByteArrayInputStream(thumbnail), thumbnail.length,
                    "image/jpeg", thumbnailKey);
            stored.add(thumbnailKey);

            Image image = new Image();
            image.setName(createFileName(file.getOriginalFilename(), decoded.format()));
            image.setFormat(decoded.format());
            image.setWidth(decoded.image().getWidth());
            image.setHeight(decoded.image().getHeight());
            image.setSize((long) bytes.length);
            image.setStoragePath(storageKey);
            image.setThumbnailPath(thumbnailKey);
            image.setUser(userRepository.getReferenceById(userId));
            image.setFolder(folder);

            return imageRepository.save(image);

        } catch (IOException | RuntimeException exception) {
            deleteFilesQuietly(stored);
            throw exception;
        }
    }

    @Transactional(readOnly = true)
    public Image getImage(UUID imageId, UUID userId) {
        return imageRepository.findByIdAndUser_Id(imageId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Image not found."));
    }

    @Transactional(readOnly = true)
    public List<Image> listImages(UUID userId, UUID folderId) {
        if (folderId == null) {
            return imageRepository.findAllByUser_IdAndFolderIsNullOrderByNameAsc(userId);
        }

        findOwnedFolder(folderId, userId);

        return imageRepository.findAllByUser_IdAndFolder_IdOrderByNameAsc(userId, folderId);
    }

    public InputStream openOriginal(Image image) throws IOException {
        return storage.load(image.getStoragePath());
    }

    public InputStream openThumbnail(Image image) throws IOException {
        return storage.load(image.getThumbnailPath());
    }

    @Transactional
    public Image renameImage(UUID imageId, UUID userId, String newName) {
        Image image = getImage(imageId, userId);
        image.setName(validateName(newName));
        return image;
    }

    @Transactional
    public Image moveImage(UUID imageId, UUID userId, UUID folderId) {
        Image image = getImage(imageId, userId);
        image.setFolder(findOwnedFolder(folderId, userId));
        return image;
    }

    @Transactional
    public void deleteImage(UUID imageId, UUID userId) {
        deleteImages(List.of(getImage(imageId, userId)));
    }


    @Transactional
    public void deleteImages(List<Image> images) {
        if (images.isEmpty()) {
            return;
        }

        imageRepository.deleteAll(images);

        List<String> keys = images.stream()
                .flatMap(image -> Stream.of(image.getStoragePath(), image.getThumbnailPath()))
                .filter(Objects::nonNull)
                .toList();

        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    deleteFilesQuietly(keys);
                }
            });
        } else {
            deleteFilesQuietly(keys);
        }
    }

    // Download

    public DownloadedImage downloadImage(UUID imageId, UUID userId, String requestedFormat) throws IOException {
        Image metadata = getImage(imageId, userId);
        String format = normalizeFormat(requestedFormat);

        byte[] content;
        try (InputStream input = openOriginal(metadata)) {
            content = input.readAllBytes();
        }

        if (!format.equals(metadata.getFormat())) {
            content = encode(decode(content).image(), format);
        }

        return new DownloadedImage(
                content,
                contentType(format),
                removeExtension(metadata.getName()) + "." + extension(format)
        );
    }

    // Decoding and encoding

    public DecodedImage decode(byte[] bytes) throws IOException {
        try (ImageInputStream input = ImageIO.createImageInputStream(new ByteArrayInputStream(bytes))) {
            if (input == null) {
                throw new IOException("Invalid image.");
            }

            Iterator<ImageReader> readers = ImageIO.getImageReaders(input);

            if (!readers.hasNext()) {
                throw new IOException("Unsupported image format.");
            }

            ImageReader reader = readers.next();

            try {
                reader.setInput(input, true, true);

                String format = normalizeFormat(reader.getFormatName());
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);

                if (width <= 0 || height <= 0
                        || width > MAX_DIMENSION
                        || height > MAX_DIMENSION
                        || (long) width * height > MAX_PIXELS) {
                    throw new IOException("Image dimensions exceed the allowed limit.");
                }

                return new DecodedImage(format, reader.read(0));
            } finally {
                reader.dispose();
            }
        }
    }

    public byte[] encode(BufferedImage image, String format) throws IOException {
        BufferedImage source = format.equals("jpeg") && image.getType() != BufferedImage.TYPE_INT_RGB
                ? toRgb(image)
                : image;

        ByteArrayOutputStream output = new ByteArrayOutputStream();

        if (!ImageIO.write(source, format, output)) {
            throw new IOException("No image writer available for format: " + format);
        }

        return output.toByteArray();
    }

    private byte[] createThumbnail(BufferedImage original) throws IOException {
        double scale = Math.min(
                1.0,
                (double) THUMBNAIL_SIZE / Math.max(original.getWidth(), original.getHeight())
        );

        int width = Math.max(1, (int) Math.round(original.getWidth() * scale));
        int height = Math.max(1, (int) Math.round(original.getHeight() * scale));

        BufferedImage thumbnail = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D graphics = thumbnail.createGraphics();

        try {
            graphics.setRenderingHint(
                    RenderingHints.KEY_INTERPOLATION,
                    RenderingHints.VALUE_INTERPOLATION_BICUBIC
            );
            graphics.drawImage(original, 0, 0, width, height, Color.WHITE, null);
        } finally {
            graphics.dispose();
        }

        return encode(thumbnail, "jpeg");
    }

    private BufferedImage toRgb(BufferedImage original) {
        BufferedImage converted = new BufferedImage(
                original.getWidth(), original.getHeight(), BufferedImage.TYPE_INT_RGB
        );

        Graphics2D graphics = converted.createGraphics();

        try {
            graphics.drawImage(original, 0, 0, Color.WHITE, null);
        } finally {
            graphics.dispose();
        }

        return converted;
    }

    // Helpers

    private Folder findOwnedFolder(UUID folderId, UUID userId) {
        if (folderId == null) {
            return null;
        }

        return folderRepository.findByIdAndUser_Id(folderId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Folder not found."));
    }

    private void deleteFilesQuietly(List<String> keys) {
        for (String key : keys) {
            try {
                storage.delete(key);
            } catch (Exception exception) {
                log.warn("Could not delete stored file {}", key, exception);
            }
        }
    }

    private String normalizeFormat(String format) {
        if (format == null) {
            throw new IllegalArgumentException("Image format is required.");
        }

        return switch (format.toLowerCase(Locale.ROOT).trim().replace(".", "")) {
            case "png" -> "png";
            case "jpg", "jpeg" -> "jpeg";
            case "tif", "tiff" -> "tiff";
            default -> throw new IllegalArgumentException("Supported formats are PNG, JPEG and TIFF.");
        };
    }

    private String extension(String format) {
        return format.equals("jpeg") ? "jpg" : format;
    }

    private String contentType(String format) {
        return switch (format) {
            case "png" -> "image/png";
            case "jpeg" -> "image/jpeg";
            case "tiff" -> "image/tiff";
            default -> "application/octet-stream";
        };
    }

    private String createFileName(String originalName, String format) {
        String name = originalName == null ? "image" : originalName.replace('\\', '/');
        name = removeExtension(name.substring(name.lastIndexOf('/') + 1).trim());
        name = name.replaceAll("\\p{Cntrl}", "_");

        if (name.isBlank()) {
            name = "image";
        }

        if (name.length() > 240) {
            name = name.substring(0, 240);
        }

        return name + "." + extension(format);
    }

    private String removeExtension(String name) {
        int dot = name.lastIndexOf('.');
        return dot > 0 ? name.substring(0, dot) : name;
    }

    private String validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Image name cannot be empty.");
        }

        String validated = name.trim();

        if (validated.length() > 255
                || validated.contains("/")
                || validated.contains("\\")
                || validated.chars().anyMatch(Character::isISOControl)) {
            throw new IllegalArgumentException("Invalid image name.");
        }

        return validated;
    }

    public record DecodedImage(String format, BufferedImage image) {
    }

    public record DownloadedImage(byte[] content, String contentType, String fileName) {
    }
}