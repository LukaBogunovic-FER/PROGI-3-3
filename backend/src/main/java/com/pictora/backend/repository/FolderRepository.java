
package com.pictora.backend.repository;

import com.pictora.backend.entity.Folder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    Optional<Folder> findByIdAndUser_Id(UUID folderId, UUID userId);

    List<Folder> findAllByUser_IdAndParentIsNullOrderByNameAsc(UUID userId);

    List<Folder> findAllByUser_IdAndParent_IdOrderByNameAsc(UUID userId, UUID parentId);

    boolean existsByParent_Id(UUID folderId);
}
