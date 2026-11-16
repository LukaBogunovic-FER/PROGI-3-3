
package com.pictora.backend.service;

import com.pictora.backend.entity.Folder;
import com.pictora.backend.entity.Image;
import com.pictora.backend.entity.UserAccount;
import com.pictora.backend.repository.FolderRepository;
import com.pictora.backend.repository.ImageRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.UUID;

@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final ImageRepository imageRepository;
    private final UserAccountService userAccountService;
    private final FileStorageService fileStorageService;

    public FolderService(
            FolderRepository folderRepository,
            ImageRepository imageRepository,
            UserAccountService userAccountService,
            FileStorageService fileStorageService
    ) {
        this.folderRepository = folderRepository;
        this.imageRepository = imageRepository;
        this.userAccountService = userAccountService;
        this.fileStorageService = fileStorageService;
    }

    @Transactional(readOnly = true)
    public Folder getFolder(UUID folderId, UUID userId) {
        return folderRepository.findByIdAndUser_Id(folderId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Folder not found: " + folderId
                ));
    }

    @Transactional(readOnly = true)
    public List<Folder> getRootFolders(UUID userId) {
        return folderRepository
                .findAllByUser_IdAndParentIsNullOrderByNameAsc(userId);
    }

    @Transactional(readOnly = true)
    public List<Folder> getSubfolders(UUID parentId, UUID userId) {
        if (parentId == null) {
            return getRootFolders(userId);
        }

        getFolder(parentId, userId);

        return folderRepository
                .findAllByUser_IdAndParent_IdOrderByNameAsc(userId, parentId);
    }

    @Transactional
    public Folder createFolder(UUID userId, UUID parentId, String name) {
        String validatedName = validateName(name);

        UserAccount user = userAccountService.getById(userId);

        Folder parent = null;
        if (parentId != null) {
            parent = getFolder(parentId, userId);
        }

        Folder folder = new Folder();
        folder.setName(validatedName);
        folder.setUser(user);
        folder.setParent(parent);

        return folderRepository.save(folder);
    }

    @Transactional
    public Folder renameFolder(UUID folderId, UUID userId, String newName) {
        Folder folder = getFolder(folderId, userId);
        folder.setName(validateName(newName));

        return folderRepository.save(folder);
    }

    @Transactional
    public Folder moveFolder(UUID folderId, UUID userId, UUID newParentId) {
        Folder folder = getFolder(folderId, userId);

        Folder newParent = null;
        if (newParentId != null) {
            newParent = getFolder(newParentId, userId);
            checkForCycle(folder, newParent);
        }

        folder.setParent(newParent);

        return folderRepository.save(folder);
    }

    @Transactional
    public void deleteFolder(UUID folderId, UUID userId) {
        Folder folder = getFolder(folderId, userId);
        deleteFolderRecursively(folder, userId);
    }

    private void deleteFolderRecursively(Folder folder, UUID userId) {

        List<Folder> children = folderRepository
                .findAllByUser_IdAndParent_IdOrderByNameAsc(
                        userId,
                        folder.getId()
                );

        for (Folder child : children) {
            deleteFolderRecursively(child, userId);
        }

        List<Image> images = imageRepository
                .findAllByUser_IdAndFolder_Id(userId, folder.getId());

        for (Image image : images) {
            deleteStoredFile(image.getStoragePath());
            deleteStoredFile(image.getThumbnailPath());
            imageRepository.delete(image);
        }

        folderRepository.delete(folder);
    }

    private void deleteStoredFile(String storageKey) {
        if (storageKey == null || storageKey.isBlank()) {
            return;
        }

        try {
            fileStorageService.delete(storageKey);
        } catch (IOException exception) {
            throw new UncheckedIOException(
                    "Could not delete file from storage: " + storageKey,
                    exception
            );
        }
    }

    private void checkForCycle(Folder folder, Folder newParent) {
        Folder current = newParent;

        while (current != null) {
            if (current.getId().equals(folder.getId())) {
                throw new IllegalArgumentException(
                        "A folder cannot be moved into itself or its descendants."
                );
            }

            current = current.getParent();
        }
    }

    private String validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException(
                    "Folder name cannot be empty."
            );
        }

        return name.trim();
    }
}
