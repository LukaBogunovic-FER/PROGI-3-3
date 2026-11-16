
package com.pictora.backend.service;

import org.junit.jupiter.api.Test;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class R2FileStorageServiceTest {

    @Test
    void shouldUploadReadAndDeleteFile() throws IOException {

        String endpoint = getRequiredEnv("R2_ENDPOINT");
        String accessKey = getRequiredEnv("R2_ACCESS_KEY");
        String secretKey = getRequiredEnv("R2_SECRET_KEY");
        String bucket = getRequiredEnv("R2_BUCKET");

        R2FileStorageService storage = new R2FileStorageService(
                endpoint,
                accessKey,
                secretKey,
                bucket
        );

        String storageKey = "tests/" + UUID.randomUUID() + ".txt";

        byte[] expectedContent =
                "Pictora R2 storage test".getBytes(StandardCharsets.UTF_8);

        try {
            // Upload
            storage.store(
                    new ByteArrayInputStream(expectedContent),
                    expectedContent.length,
                    "text/plain",
                    storageKey
            );

            // Check existence
            assertTrue(
                    storage.exists(storageKey),
                    "Uploaded file should exist in R2."
            );

            // Download and compare content
            byte[] actualContent;

            try (InputStream input = storage.load(storageKey)) {
                actualContent = input.readAllBytes();
            }

            assertArrayEquals(
                    expectedContent,
                    actualContent,
                    "Downloaded content should match uploaded content."
            );

            // Delete
            storage.delete(storageKey);

            assertFalse(
                    storage.exists(storageKey),
                    "Deleted file should not exist in R2."
            );

        } finally {
            try {
                storage.delete(storageKey);
            } catch (IOException ignored) {
                // Ignore cleanup errors.
            }

            storage.close();
        }
    }

    private static String getRequiredEnv(String name) {
        String value = System.getenv(name);

        if (value == null || value.isBlank()) {
            throw new IllegalStateException(
                    "Missing environment variable: " + name
            );
        }

        return value.trim();
    }
}
