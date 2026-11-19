package hr.fer.pictora.service;

// Java utilities for file handling and storage
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

// Java utilities for collections and unique filenames
import java.util.List;
import java.util.UUID;
import java.util.stream.Stream;

// Spring utilities for accessing stored files
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;

// Spring annotations and uploaded file representation
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Handles local storage of uploaded images.
 */
@Service
public class ImageStorageService {

    // Directory where uploaded images are stored
    private final Path uploadDirectory = Paths.get("uploads")
                                              .toAbsolutePath()
                                              .normalize();
    
    /**
     * Saves an uploaded image to the local uploads directory.
     * Returns the generated filename.
     */
    public String saveImage(MultipartFile file) throws IOException {
        
        // Reject empty files
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Image file cannot be empty.");
        }

        String contentType = file.getContentType();

        // Debug
        System.out.println("Received content type: " + contentType);
        System.out.println("Received filename: " + file.getOriginalFilename());

        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("Only image files are allowed.");
        }

        // Create the uploads directory if it does not exist
        Files.createDirectories(uploadDirectory);

        // Determine the file extension from the uploaded image type
        String extension;

        switch (contentType) {
            case "image/png"  -> extension = ".png";
            case "image/jpeg" -> extension = ".jpg";
            case "image/webp" -> extension = ".webp";
            default -> throw new IllegalArgumentException("Unsupported image format.");
        }

        // Generate a unique filename
        String filename = UUID.randomUUID() + extension;

        // Save the uploaded file to disk
        Path destination = uploadDirectory.resolve(filename);

        Files.copy(file.getInputStream(), destination);

        return filename;
    }
    
    /** 
     * Retrieves a stored image by its filename. 
     */
    public Resource getImage(String filename) throws IOException {

        // Resolve the requested filename inside the uploads directory
        Path imagePath = uploadDirectory.resolve(filename).normalize();

        // Prevent access to files outside the uploads directory
        if (!imagePath.startsWith(uploadDirectory)) {
            throw new IllegalArgumentException("Invalid image filename.");
        }

        // Check whether the requested image exists
        if (!Files.isRegularFile(imagePath)) {
            throw new java.io.FileNotFoundException("Image not found.");
        }

        // Return the image as a resource
        return new UrlResource(imagePath.toUri());
    }

    /** 
     * Returns the filenames of all stored images. 
     */
    public List<String> getAllImages() throws IOException {

        // Create the uploads directory if it does not exist
        Files.createDirectories(uploadDirectory);

        // Read all regular files from the uploads directory
        try (Stream<Path> files = Files.list(uploadDirectory)) {
            return files.filter(Files::isRegularFile)
                        .filter(path -> {
                            String name = path.getFileName()
                                              .toString()
                                              .toLowerCase();

                            return name.endsWith(".png") 
                                || name.endsWith(".jpg")
                                || name.endsWith(".jpeg")
                                || name.endsWith(".webp");
                        })
                    .map(path -> path.getFileName().toString())
                    .sorted()
                    .toList();
        }
    }
}