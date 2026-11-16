
package com.pictora.backend.service;

import jakarta.annotation.PreDestroy;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.http.urlconnection.UrlConnectionHttpClient;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectResponse;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.NoSuchFileException;
import java.net.URI;

@Service
@ConditionalOnProperty(
        name = "pictora.storage.provider",
        havingValue = "r2"
)
public class R2FileStorageService implements FileStorageService {

    private final S3Client s3Client;
    private final String bucketName;

    public R2FileStorageService(
            @Value("${pictora.storage.r2.endpoint}") String endpoint,
            @Value("${pictora.storage.r2.access-key}") String accessKey,
            @Value("${pictora.storage.r2.secret-key}") String secretKey,
            @Value("${pictora.storage.r2.bucket}") String bucketName
    ) {
        if (isBlank(endpoint)
                || isBlank(accessKey)
                || isBlank(secretKey)
                || isBlank(bucketName)) {

            throw new IllegalStateException(
                    "R2 configuration missing values: "
                            + "endpoint=" + isBlank(endpoint)
                            + ", accessKey=" + isBlank(accessKey)
                            + ", secretKey=" + isBlank(secretKey)
                            + ", bucket=" + isBlank(bucketName)
            );
        }

        this.bucketName = bucketName.trim();

        this.s3Client = S3Client.builder()
                .endpointOverride(URI.create(endpoint.trim()))
                .credentialsProvider(
                        StaticCredentialsProvider.create(
                                AwsBasicCredentials.create(
                                        accessKey.trim(),
                                        secretKey.trim()
                                )
                        )
                )
                .region(Region.of("auto"))
                .serviceConfiguration(
                        S3Configuration.builder()
                                .pathStyleAccessEnabled(true)
                                .build()
                )
                .httpClient(UrlConnectionHttpClient.create())
                .build();
    }

    @Override
    public void store(
            InputStream inputStream,
            long contentLength,
            String contentType,
            String storageKey
    ) throws IOException {

        validateStorageKey(storageKey);

        if (inputStream == null) {
            throw new IllegalArgumentException(
                    "Input stream cannot be null."
            );
        }

        if (contentLength < 0) {
            throw new IllegalArgumentException(
                    "Content length cannot be negative."
            );
        }

        String resolvedContentType = isBlank(contentType)
                ? "application/octet-stream"
                : contentType;

        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(storageKey)
                .contentType(resolvedContentType)
                .build();

        try {
            s3Client.putObject(
                    request,
                    RequestBody.fromInputStream(inputStream, contentLength)
            );
        } catch (S3Exception exception) {
            throw new IOException(
                    "Could not upload file to Cloudflare R2.",
                    exception
            );
        }
    }

    @Override
    public InputStream load(String storageKey) throws IOException {

        validateStorageKey(storageKey);

        GetObjectRequest request = GetObjectRequest.builder()
                .bucket(bucketName)
                .key(storageKey)
                .build();

        try {
            ResponseInputStream<GetObjectResponse> response =
                    s3Client.getObject(request);

            return response;
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                throw new NoSuchFileException(storageKey);
            }

            throw new IOException(
                    "Could not download file from Cloudflare R2.",
                    exception
            );
        }
    }

    @Override
    public void delete(String storageKey) throws IOException {

        validateStorageKey(storageKey);

        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(bucketName)
                .key(storageKey)
                .build();

        try {
            s3Client.deleteObject(request);
        } catch (S3Exception exception) {
            throw new IOException(
                    "Could not delete file from Cloudflare R2.",
                    exception
            );
        }
    }

    @Override
    public boolean exists(String storageKey) throws IOException {

        validateStorageKey(storageKey);

        HeadObjectRequest request = HeadObjectRequest.builder()
                .bucket(bucketName)
                .key(storageKey)
                .build();

        try {
            s3Client.headObject(request);
            return true;
        } catch (S3Exception exception) {
            if (exception.statusCode() == 404) {
                return false;
            }

            throw new IOException(
                    "Could not check file in Cloudflare R2.",
                    exception
            );
        }
    }

    private void validateStorageKey(String storageKey) {

        if (isBlank(storageKey)
                || storageKey.startsWith("/")
                || storageKey.contains("\\")
                || storageKey.contains("\0")) {
            throw new IllegalArgumentException(
                    "Invalid storage key."
            );
        }

        String[] segments = storageKey.split("/", -1);

        for (String segment : segments) {
            if (segment.isBlank()
                    || segment.equals(".")
                    || segment.equals("..")) {
                throw new IllegalArgumentException(
                        "Invalid storage key."
                );
            }
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @PreDestroy
    public void close() {
        if (s3Client != null) {
            s3Client.close();
        }
    }
}
