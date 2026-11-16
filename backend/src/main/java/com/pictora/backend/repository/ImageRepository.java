
package com.pictora.backend.repository;

import com.pictora.backend.entity.Folder;
import com.pictora.backend.entity.Image;
import com.pictora.backend.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ImageRepository extends JpaRepository<Image, UUID> {

    List<Image> findByUserAndFolder(UserAccount user, Folder folder);

    Optional<Image> findByIdAndUser(UUID id, UserAccount user);

    List<Image> findByFolderId(UUID folderId);
}
