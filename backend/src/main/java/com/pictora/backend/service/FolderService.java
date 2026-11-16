package com.pictora.backend.service;

import com.pictora.backend.entity.Folder;
import com.pictora.backend.entity.Image;
import com.pictora.backend.repository.FolderRepository;
import com.pictora.backend.repository.ImageRepository;
import com.pictora.backend.repository.UserAccountRepository;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class FolderService {

    private final FolderRepository folderRepository;
    private final ImageRepository imageRepository;
    private final ImageService imageService;
    private final UserAccountRepository userRepository;

    public FolderService(
            FolderRepository folderRepository,
            ImageRepository imageRepository,
            ImageService imageService,
            UserAccountRepository userRepository
    ) {
        this.folderRepository = folderRepository;
        this.imageRepository = imageRepository;
        this.imageService = imageService;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public Folder getFolder(UUID folderId, UUID userId) {
        return folderRepository.findByIdAndUser_Id(folderId, userId)
                .orElseThrow(() -> new EntityNotFoundException("Folder not found: " + folderId));
    }

    @Transactional(readOnly = true)
    public List<Folder> getSubfolders(UUID parentId, UUID userId) {
        if (parentId == null) {
            return folderRepository.findAllByUser_IdAndParentIsNullOrderByNameAsc(userId);
        }
        //ownership check
        getFolder(parentId, userId);

        return folderRepository.findAllByUser_IdAndParent_IdOrderByNameAsc(userId, parentId);
    }

    @Transactional
    public Folder createFolder(UUID userId, UUID parentId, String name) {
        Folder folder = new Folder();
        folder.setName(validateName(name));
        folder.setUser(userRepository.getReferenceById(userId));
        folder.setParent(parentId == null ? null : getFolder(parentId, userId));

        return folderRepository.save(folder);
    }

    @Transactional
    public Folder renameFolder(UUID folderId, UUID userId, String newName) {
        Folder folder = getFolder(folderId, userId);
        folder.setName(validateName(newName));
        return folder;
    }

    @Transactional
    public Folder moveFolder(UUID folderId, UUID userId, UUID newParentId) {
        Folder folder = getFolder(folderId, userId);
        Folder newParent = newParentId == null ? null : getFolder(newParentId, userId);

        checkForCycle(folder, newParent);
        folder.setParent(newParent);

        return folder;
    }

    @Transactional
    public void deleteFolder(UUID folderId, UUID userId) {
        // Collect the folder and all descendants
        List<Folder> folders = new ArrayList<>(List.of(getFolder(folderId, userId)));

        for (int i = 0; i < folders.size(); i++) {
            folders.addAll(folderRepository.findAllByUser_IdAndParent_IdOrderByNameAsc(
                    userId, folders.get(i).getId()
            ));
        }

        List<Image> images = new ArrayList<>();

        for (Folder folder : folders) {
            images.addAll(imageRepository.findAllByUser_IdAndFolder_IdOrderByNameAsc(
                    userId, folder.getId()
            ));
        }

        imageService.deleteImages(images);

        Collections.reverse(folders);
        folderRepository.deleteAll(folders);
    }

    private void checkForCycle(Folder folder, Folder newParent) {
        for (Folder current = newParent; current != null; current = current.getParent()) {
            if (current.getId().equals(folder.getId())) {
                throw new IllegalArgumentException(
                        "A folder cannot be moved into itself or its descendants."
                );
            }
        }
    }

    private String validateName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Folder name cannot be empty.");
        }

        return name.trim();
    }
}