
package com.pictora.backend.repository;

import com.pictora.backend.entity.Image;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ImageRepository extends JpaRepository<Image, UUID> {

    Optional<Image> findByIdAndUser_Id(UUID imageId, UUID userId);

    List<Image> findAllByUser_IdAndFolder_Id(
            UUID userId,
            UUID folderId
    );

    List<Image> findAllByUser_IdAndFolderIsNullOrderByNameAsc(
            UUID userId
    );
}
