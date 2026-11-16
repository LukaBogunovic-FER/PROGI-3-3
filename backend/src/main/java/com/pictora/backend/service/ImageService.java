
package com.pictora.backend.service;

import com.pictora.backend.entity.Folder;
import com.pictora.backend.entity.Image;
import com.pictora.backend.entity.UserAccount;
import com.pictora.backend.repository.FolderRepository;
import com.pictora.backend.repository.ImageRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.stream.ImageInputStream;

import java.awt.Graphics2D;
import java.awt.RenderingHints;
import java.awt.image.BufferedImage;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;

import java.util.Iterator;
import java.util.Locale;
import java.util.UUID;

@Service
public class ImageService {

    private static final long MAX_FILE_SIZE = 20L * 1024 * 1024;
    private static final long MAX_IMAGE_PIXELS = 40_000_000L;
    private static final int MAX_IMAGE_DIMENSION = 10_000;
    private static final int THUMBNAIL_SIZE = 400;

    private final ImageRepository imageRepository;
    private final FolderRepository folderRepository;
    private final UserAccountService userAccountService;
    private final FileStorageService fileStorageService;

    public ImageService(
            ImageRepository imageRepository,
            FolderRepository folderRepository,
            UserAccountService userAccountService,
            FileStorageService fileStorageService
    ) {
        this.imageRepository = imageRepository;
        this.folderRepository = folderRepository;
        this.userAccountService = userAccountService;
        this.fileStorageService = fileStorageService;
    }

    // Upload image and save its metadata.

    @Transactional(rollbackFor = Exception.class)
    public Image uploadImage(
            UUID userId,
            MultipartFile file,
            UUID folderId
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "Maximum file size is 20 MB."
            );
        }

        byte[] originalBytes = file.getBytes();

        if (originalBytes.length == 0 ||
                originalBytes.length > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Invalid file size.");
        }

        DecodedImage decodedImage = decodeImage(originalBytes);

        UserAccount user = userAccountService.getById(userId);

        Folder folder = null;

        if (folderId != null) {
            folder = folderRepository
                    .findByIdAndUser_Id(folderId, userId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Folder not found."
                    ));
        }

        String fileName = createFileName(
                file.getOriginalFilename(),
                decodedImage.format()
        );

        byte[] thumbnailBytes = createThumbnail(decodedImage.image());

        UUID objectId = UUID.randomUUID();

        String extension = getExtension(decodedImage.format());

        String storageKey =
                "images/" + userId + "/" + objectId + "." + extension;

        String thumbnailKey =
                "thumbnails/" + userId + "/" + objectId + ".jpg";

        boolean originalUploaded = false;
        boolean thumbnailUploaded = false;

        try {
            fileStorageService.store(
                    new ByteArrayInputStream(originalBytes),
                    originalBytes.length,
                    getContentType(decodedImage.format()),
                    storageKey
            );

            originalUploaded = true;

            fileStorageService.store(
                    new ByteArrayInputStream(thumbnailBytes),
                    thumbnailBytes.length,
                    "image/jpeg",
                    thumbnailKey
            );

            thumbnailUploaded = true;

            Image image = new Image();

            image.setName(fileName);
            image.setFormat(decodedImage.format());
            image.setWidth(decodedImage.width());
            image.setHeight(decodedImage.height());
            image.setSize((long) originalBytes.length);
            image.setStoragePath(storageKey);
            image.setThumbnailPath(thumbnailKey);
            image.setUser(user);
            image.setFolder(folder);

            return imageRepository.save(image);

        } catch (IOException | RuntimeException exception) {

            if (thumbnailUploaded) {
                cleanupStorage(thumbnailKey, exception);
            }

            if (originalUploaded) {
                cleanupStorage(storageKey, exception);
            }

            throw exception;
        }
    }

    // Get image metadata.

    @Transactional(readOnly = true)
    public Image getImage(UUID imageId, UUID userId) {

        return imageRepository.findByIdAndUser_Id(imageId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Image not found."
                ));
    }

    // Load original image from R2.

    public InputStream loadImage(
            UUID imageId,
            UUID userId
    ) throws IOException {

        Image image = getImage(imageId, userId);

        return fileStorageService.load(image.getStoragePath());
    }

    // Load thumbnail from R2.

    public InputStream loadThumbnail(
            UUID imageId,
            UUID userId
    ) throws IOException {

        Image image = getImage(imageId, userId);

        return fileStorageService.load(image.getThumbnailPath());
    }

    // Rename image.

    @Transactional
    public Image renameImage(
            UUID imageId,
            UUID userId,
            String newName
    ) {

        Image image = getImage(imageId, userId);

        image.setName(validateName(newName));

        return imageRepository.save(image);
    }

    // Move image to another folder or root.

    @Transactional
    public Image moveImage(
            UUID imageId,
            UUID userId,
            UUID folderId
    ) {

        Image image = getImage(imageId, userId);

        Folder folder = null;

        if (folderId != null) {
            folder = folderRepository
                    .findByIdAndUser_Id(folderId, userId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Folder not found."
                    ));
        }

        image.setFolder(folder);

        return imageRepository.save(image);
    }

    // Delete image from R2 and PostgreSQL.

    @Transactional(rollbackFor = Exception.class)
    public void deleteImage(
            UUID imageId,
            UUID userId
    ) throws IOException {

        Image image = getImage(imageId, userId);

        if (image.getStoragePath() != null) {
            fileStorageService.delete(image.getStoragePath());
        }

        if (image.getThumbnailPath() != null) {
            fileStorageService.delete(image.getThumbnailPath());
        }

        imageRepository.delete(image);
    }

    // Download image in a selected format.

    public DownloadedImage downloadImage(
            UUID imageId,
            UUID userId,
            String requestedFormat
    ) throws IOException {

        Image metadata = getImage(imageId, userId);

        String format = normalizeFormat(requestedFormat);

        byte[] originalBytes;

        try (InputStream inputStream =
                     fileStorageService.load(metadata.getStoragePath())) {

            originalBytes = inputStream.readAllBytes();
        }

        DecodedImage decodedImage = decodeImage(originalBytes);

        BufferedImage image = decodedImage.image();

        if (format.equals("jpeg")) {
            image = convertToRgb(image);
        }

        ByteArrayOutputStream outputStream =
                new ByteArrayOutputStream();

        boolean written = ImageIO.write(
                image,
                format,
                outputStream
        );

        if (!written) {
            throw new IOException(
                    "No image writer available for format: " + format
            );
        }

        String baseName = removeExtension(metadata.getName());

        String downloadName =
                baseName + "." + getExtension(format);

        return new DownloadedImage(
                outputStream.toByteArray(),
                getContentType(format),
                downloadName
        );
    }

    // Decode and validate uploaded image.

    private DecodedImage decodeImage(byte[] bytes) throws IOException {

        try (ImageInputStream input = ImageIO.createImageInputStream(
                new ByteArrayInputStream(bytes)
        )) {

            if (input == null) {
                throw new IOException("Invalid image.");
            }

            Iterator<ImageReader> readers =
                    ImageIO.getImageReaders(input);

            if (!readers.hasNext()) {
                throw new IOException("Unsupported image format.");
            }

            ImageReader reader = readers.next();

            try {
                reader.setInput(input, true, true);

                String format = normalizeFormat(
                        reader.getFormatName()
                );

                int width = reader.getWidth(0);
                int height = reader.getHeight(0);

                if (width <= 0 || height <= 0 ||
                        width > MAX_IMAGE_DIMENSION ||
                        height > MAX_IMAGE_DIMENSION ||
                        (long) width * height > MAX_IMAGE_PIXELS) {
                    throw new IOException(
                            "Image dimensions exceed the allowed limit."
                    );
                }

                BufferedImage image = reader.read(0);

                if (image == null) {
                    throw new IOException("Could not decode image.");
                }

                return new DecodedImage(
                        format,
                        image,
                        width,
                        height
                );

            } finally {
                reader.dispose();
            }
        }
    }

    // Create a smaller JPEG thumbnail.

    private byte[] createThumbnail(
            BufferedImage original
    ) throws IOException {

        double scale = Math.min(
                1.0,
                Math.min(
                        (double) THUMBNAIL_SIZE / original.getWidth(),
                        (double) THUMBNAIL_SIZE / original.getHeight()
                )
        );

        int width = Math.max(
                1,
                (int) Math.round(original.getWidth() * scale)
        );

        int height = Math.max(
                1,
                (int) Math.round(original.getHeight() * scale)
        );

        BufferedImage thumbnail = new BufferedImage(
                width,
                height,
                BufferedImage.TYPE_INT_RGB
        );

        Graphics2D graphics = thumbnail.createGraphics();

        try {
            graphics.setRenderingHint(
                    RenderingHints.KEY_INTERPOLATION,
                    RenderingHints.VALUE_INTERPOLATION_BICUBIC
            );

            graphics.setRenderingHint(
                    RenderingHints.KEY_RENDERING,
                    RenderingHints.VALUE_RENDER_QUALITY
            );

            graphics.setRenderingHint(
                    RenderingHints.KEY_ANTIALIASING,
                    RenderingHints.VALUE_ANTIALIAS_ON
            );

            graphics.drawImage(
                    original,
                    0,
                    0,
                    width,
                    height,
                    null
            );

        } finally {
            graphics.dispose();
        }

        ByteArrayOutputStream output = new ByteArrayOutputStream();

        if (!ImageIO.write(thumbnail, "jpeg", output)) {
            throw new IOException("Could not create thumbnail.");
        }

        return output.toByteArray();
    }

    // Convert image to RGB for JPEG output.

    private BufferedImage convertToRgb(BufferedImage original) {

        BufferedImage converted = new BufferedImage(
                original.getWidth(),
                original.getHeight(),
                BufferedImage.TYPE_INT_RGB
        );

        Graphics2D graphics = converted.createGraphics();

        try {
            graphics.drawImage(
                    original,
                    0,
                    0,
                    java.awt.Color.WHITE,
                    null
            );

        } finally {
            graphics.dispose();
        }

        return converted;
    }

    private String normalizeFormat(String format) {

        if (format == null) {
            throw new IllegalArgumentException(
                    "Image format is required."
            );
        }

        String normalized = format
                .toLowerCase(Locale.ROOT)
                .trim()
                .replace(".", "");

        return switch (normalized) {
            case "png" -> "png";
            case "jpg", "jpeg" -> "jpeg";
            case "tif", "tiff" -> "tiff";
            default -> throw new IllegalArgumentException(
                    "Supported formats are PNG, JPEG and TIFF."
            );
        };
    }

    private String getExtension(String format) {

        return switch (format) {
            case "jpeg" -> "jpg";
            case "png" -> "png";
            case "tiff" -> "tiff";
            default -> throw new IllegalArgumentException(
                    "Unsupported format."
            );
        };
    }

    private String getContentType(String format) {

        return switch (format) {
            case "png" -> "image/png";
            case "jpeg" -> "image/jpeg";
            case "tiff" -> "image/tiff";
            default -> "application/octet-stream";
        };
    }

    private String createFileName(
            String originalName,
            String format
    ) {

        String name = originalName == null
                ? "image"
                : originalName.replace('\\', '/');

        name = name.substring(name.lastIndexOf('/') + 1).trim();

        name = removeExtension(name);
        name = name.replaceAll("[\\p{Cntrl}]", "_");

        if (name.isBlank()) {
            name = "image";
        }

        if (name.length() > 240) {
            name = name.substring(0, 240);
        }

        return name + "." + getExtension(format);
    }

    private String removeExtension(String name) {

        if (name == null) {
            return "image";
        }

        int dot = name.lastIndexOf('.');

        if (dot > 0) {
            return name.substring(0, dot);
        }

        return name;
    }

    private String validateName(String name) {

        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "Image name cannot be empty."
            );
        }

        String validated = name.trim();

        if (validated.length() > 255 ||
                validated.contains("/") ||
                validated.contains("\\") ||
                validated.chars().anyMatch(Character::isISOControl)) {
            throw new IllegalArgumentException(
                    "Invalid image name."
            );
        }

        return validated;
    }

    private void cleanupStorage(
            String storageKey,
            Throwable originalException
    ) {

        try {
            fileStorageService.delete(storageKey);
        } catch (IOException cleanupException) {
            originalException.addSuppressed(cleanupException);
        }
    }

    private record DecodedImage(
            String format,
            BufferedImage image,
            int width,
            int height
    ) {
    }

    public record DownloadedImage(
            byte[] content,
            String contentType,
            String fileName
    ) {
    }
}
