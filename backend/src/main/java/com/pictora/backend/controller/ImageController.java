package com.pictora.backend.controller;

import com.pictora.backend.entity.Image;
import com.pictora.backend.service.ImageService;
import com.pictora.backend.service.ImageService.DownloadedImage;

import jakarta.persistence.EntityNotFoundException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.nio.file.NoSuchFileException;
import java.util.*;

import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static java.nio.charset.StandardCharsets.UTF_8;
import static org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;
import static org.springframework.http.MediaType.parseMediaType;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageService imageService;

    public ImageController(ImageService imageService) {
        this.imageService = imageService;
    }

    // ---------- Endpoints ----------

    @PostMapping(consumes = MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ImageResponse> uploadImage(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folderId", required = false) UUID folderId
    ) throws IOException {
        Image image = imageService.uploadImage(userId, file, folderId);

        return ResponseEntity
                .created(URI.create("/api/images/" + image.getId()))
                .body(toResponse(image));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImageResponse> getImage(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId
    ) {
        return ResponseEntity.ok(toResponse(imageService.getImage(id, userId)));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<InputStreamResource> getImageFile(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId
    ) throws IOException {
        Image image = imageService.getImage(id, userId);
        InputStream input = imageService.loadImage(id, userId);

        return inlineResponse(input, contentTypeFor(image.getFormat()), image.getName());
    }

    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<InputStreamResource> getThumbnail(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId
    ) throws IOException {
        Image image = imageService.getImage(id, userId);
        InputStream input = imageService.loadThumbnail(id, userId);

        return inlineResponse(input, "image/jpeg", "thumbnail-" + image.getName() + ".jpg");
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ImageResponse> updateImage(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody Map<String, Object> changes
    ) {
        validateChanges(changes);

        // Fail fast if the image doesn't exist or isn't owned by the user.
        Image image = imageService.getImage(id, userId);

        if (changes.containsKey("name")) {
            image = imageService.renameImage(id, userId, parseName(changes.get("name")));
        }

        if (changes.containsKey("folderId")) {
            image = imageService.moveImage(id, userId, parseFolderId(changes.get("folderId")));
        }

        return ResponseEntity.ok(toResponse(image));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteImage(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId
    ) throws IOException {
        imageService.deleteImage(id, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadImage(
            @PathVariable UUID id,
            @RequestHeader("X-User-Id") UUID userId,
            @RequestParam(defaultValue = "png") String format
    ) throws IOException {
        DownloadedImage downloaded = imageService.downloadImage(id, userId, format);

        ContentDisposition disposition = ContentDisposition.attachment()
                .filename(downloaded.fileName(), UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(parseMediaType(downloaded.contentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(downloaded.content());
    }

    // ---------- Error handling ----------

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(Exception exception) {
        return error(NOT_FOUND, exception.getMessage());
    }

    @ExceptionHandler(NoSuchFileException.class)
    public ResponseEntity<Map<String, String>> handleMissingFile(Exception exception) {
        return error(NOT_FOUND, "Image file not found.");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(Exception exception) {
        return ResponseEntity.badRequest().body(Map.of("error", exception.getMessage()));
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<Map<String, String>> handleStorageError(Exception exception) {
        return error(INTERNAL_SERVER_ERROR, "File storage operation failed.");
    }

    private ResponseEntity<Map<String, String>> error(
            org.springframework.http.HttpStatus status,
            String message
    ) {
        return ResponseEntity.status(status).body(Map.of("error", message));
    }

    // ---------- PATCH helpers ----------

    private void validateChanges(Map<String, Object> changes) {
        if (changes == null || changes.isEmpty()) {
            throw new IllegalArgumentException("At least one field must be provided.");
        }

        for (String key : changes.keySet()) {
            if (!key.equals("name") && !key.equals("folderId")) {
                throw new IllegalArgumentException("Unsupported field: " + key);
            }
        }
    }

    private String parseName(Object value) {
        if (!(value instanceof String name)) {
            throw new IllegalArgumentException("Name must be a string.");
        }
        return name;
    }

    private UUID parseFolderId(Object value) {
        if (value == null) {
            return null; // moves the image out of any folder
        }

        if (!(value instanceof String text)) {
            throw new IllegalArgumentException("Folder ID must be a UUID string or null.");
        }

        try {
            return UUID.fromString(text);
        } catch (IllegalArgumentException exception) {
            throw new IllegalArgumentException("Invalid folder ID.");
        }
    }

    // ---------- Response helpers ----------

    private ResponseEntity<InputStreamResource> inlineResponse(
            InputStream input,
            String contentType,
            String fileName
    ) {
        ContentDisposition disposition = ContentDisposition.inline()
                .filename(fileName, UTF_8)
                .build();

        return ResponseEntity.ok()
                .contentType(parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, disposition.toString())
                .body(new InputStreamResource(input));
    }

    private String contentTypeFor(String format) {
        return switch (format.toLowerCase(Locale.ROOT)) {
            case "png" -> "image/png";
            case "jpg", "jpeg" -> "image/jpeg";
            case "tif", "tiff" -> "image/tiff";
            default -> "application/octet-stream";
        };
    }

    private ImageResponse toResponse(Image image) {
        return new ImageResponse(
                image.getId(),
                image.getName(),
                image.getFormat(),
                image.getWidth(),
                image.getHeight(),
                image.getSize(),
                image.getCreatedAt() == null ? null : image.getCreatedAt().toString(),
                "/api/images/" + image.getId() + "/thumbnail"
        );
    }

    public record ImageResponse(
            UUID id,
            String name,
            String format,
            int width,
            int height,
            long size,
            String createdAt,
            String thumbnailUrl
    ) {
    }
}