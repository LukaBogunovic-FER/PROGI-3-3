package hr.fer.pictora.controller;

// Java utilities for file handling and collections
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

// Spring utilities for accessing stored images
import org.springframework.core.io.Resource;

// Spring utilities for HTTP responses
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

// Spring annotations for REST API endpoints
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

// Spring utilities for handling HTTP errors
import org.springframework.web.server.ResponseStatusException;

// Pictora service for storing and retrieving images
import hr.fer.pictora.service.ImageStorageService;

/**
 * Provides REST API endpoints for managing images.
 */
@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImageStorageService imageStorageService;

    /**
     * Receives the image storage service through dependency injection.
     */
    public ImageController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    /**
     * Receives an uploaded image and saves it to local storage.
     * Returns the generated filename.
     */
    @PostMapping
    public ResponseEntity<String> uploadImage(@RequestParam("file") MultipartFile file) throws IOException {

        String filename = imageStorageService.saveImage(file);

        return ResponseEntity.status(HttpStatus.CREATED).body(filename);
    }

    /** 
     * Returns a stored image by its filename. 
     */
    @GetMapping("/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws IOException {

        // Retrieve the image from local storage
        Resource image = null;

        try {
            image = imageStorageService.getImage(filename);
        } catch (java.io.FileNotFoundException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Image not found.");
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid image filename.");
        }

        // Determine the image's content type
        String contentType = Files.probeContentType(Path.of(image.getFile().getName()));

        // Return the image with the appropriate HTTP content type
        return ResponseEntity.ok()
                             .contentType(contentType != null
                                ? MediaType.parseMediaType(contentType)
                                : MediaType.APPLICATION_OCTET_STREAM)
                             .body(image);
    }

    /** 
     * Returns a list of all stored image filenames. 
     */
    @GetMapping
    public ResponseEntity<List<String>> getAllImages() throws IOException {

        // Retrieve all stored image filenames
        List<String> filenames = imageStorageService.getAllImages();

        // Return the filenames as a JSON array
        return ResponseEntity.ok(filenames);
    }
}