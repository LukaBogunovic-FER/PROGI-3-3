
package com.pictora.backend.service;

import java.io.IOException;
import java.io.InputStream;

public interface FileStorageService {

    void store(
            InputStream inputStream,
            long contentLength,
            String contentType,
            String storageKey
    ) throws IOException;

    InputStream load(String storageKey) throws IOException;

    void delete(String storageKey) throws IOException;

    boolean exists(String storageKey) throws IOException;
}
