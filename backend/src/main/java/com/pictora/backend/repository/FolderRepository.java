
package com.pictora.backend.repository;

import com.pictora.backend.entity.Folder;
import com.pictora.backend.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FolderRepository extends JpaRepository<Folder, UUID> {

    List<Folder> findByUserAndParent(UserAccount user, Folder parent);

    Optional<Folder> findByIdAndUser(UUID id, UserAccount user);

    List<Folder> findByParentId(UUID parentId);
}
