
package com.pictora.backend.service;

import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import com.pictora.backend.entity.Image;
import com.pictora.backend.entity.UserAccount;
import com.pictora.backend.repository.ImageRepository;
import com.pictora.backend.repository.UserAccountRepository;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ImageServiceTest {

    @DynamicPropertySource
    static void registerR2Properties(DynamicPropertyRegistry registry) {
        registry.add("pictora.storage.provider", () -> "r2");
        registry.add("pictora.storage.r2.endpoint",
                () -> System.getenv("R2_ENDPOINT"));
        registry.add("pictora.storage.r2.access-key",
                () -> System.getenv("R2_ACCESS_KEY"));
        registry.add("pictora.storage.r2.secret-key",
                () -> System.getenv("R2_SECRET_KEY"));
        registry.add("pictora.storage.r2.bucket",
                () -> System.getenv("R2_BUCKET"));
    }

    @Autowired
    private ImageService imageService;

    @Autowired
    private ImageRepository imageRepository;

    @Autowired
    private UserAccountRepository userAccountRepository;

    @Autowired
    private FileStorageService fileStorageService;

    @Test
    void shouldUploadImageAndSaveMetadata() throws Exception {

        String uniqueId = UUID.randomUUID().toString();

        // Create a test user.
        UserAccount user = new UserAccount();
        user.setUsername("r2-test-" + uniqueId.substring(0, 8));
        user.setProvider("test");
        user.setProviderSubject(uniqueId);

        user = userAccountRepository.save(user);

        Image uploadedImage = null;

        try {
            // Generate a test PNG image.
            BufferedImage sourceImage = new BufferedImage(
                    100,
                    80,
                    BufferedImage.TYPE_INT_RGB
            );

            ByteArrayOutputStream output = new ByteArrayOutputStream();

            assertTrue(ImageIO.write(sourceImage, "png", output));

            byte[] imageBytes = output.toByteArray();

            MockMultipartFile file = new MockMultipartFile(
                    "file",
                    "test-image.png",
                    "image/png",
                    imageBytes
            );

            // Upload image.
            uploadedImage = imageService.uploadImage(
                    user.getId(),
                    file,
                    null
            );

            // Check PostgreSQL metadata.
            assertNotNull(uploadedImage.getId());
            assertEquals("test-image.png", uploadedImage.getName());
            assertEquals("png", uploadedImage.getFormat());
            assertEquals(100, uploadedImage.getWidth());
            assertEquals(80, uploadedImage.getHeight());
            assertEquals(imageBytes.length, uploadedImage.getSize());

            // Check that the database contains the image.
            assertTrue(
                    imageRepository.findByIdAndUser_Id(
                            uploadedImage.getId(),
                            user.getId()
                    ).isPresent()
            );

            // Check that original and thumbnail exist in R2.
            assertTrue(
                    fileStorageService.exists(
                            uploadedImage.getStoragePath()
                    )
            );

            assertTrue(
                    fileStorageService.exists(
                            uploadedImage.getThumbnailPath()
                    )
            );

            // Check downloaded original image.
            try (InputStream input = imageService.loadImage(
                    uploadedImage.getId(),
                    user.getId()
            )) {
                BufferedImage downloadedImage = ImageIO.read(input);

                assertNotNull(downloadedImage);
                assertEquals(100, downloadedImage.getWidth());
                assertEquals(80, downloadedImage.getHeight());
            }

            // Check downloaded thumbnail.
            try (InputStream input = imageService.loadThumbnail(
                    uploadedImage.getId(),
                    user.getId()
            )) {
                BufferedImage thumbnail = ImageIO.read(input);

                assertNotNull(thumbnail);
                assertEquals(100, thumbnail.getWidth());
                assertEquals(80, thumbnail.getHeight());
            }

            // Delete uploaded image.
            imageService.deleteImage(
                    uploadedImage.getId(),
                    user.getId()
            );

            uploadedImage = null;

        } finally {
            // Best-effort cleanup if an assertion fails.
            if (uploadedImage != null) {
                try {
                    imageService.deleteImage(
                            uploadedImage.getId(),
                            user.getId()
                    );
                } catch (Exception ignored) {
                    // Preserve the original test failure.
                }
            }

            userAccountRepository.delete(user);
        }
    }
}
