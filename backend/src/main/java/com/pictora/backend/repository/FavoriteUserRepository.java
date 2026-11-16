
package com.pictora.backend.repository;

import com.pictora.backend.entity.FavoriteUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

public interface FavoriteUserRepository extends JpaRepository<FavoriteUser, UUID> {

    List<FavoriteUser> findAllByUser_IdOrderByCreatedAtDesc(UUID userId);

    boolean existsByUser_IdAndFavoriteUser_Id(UUID userId, UUID favoriteUserId);

    @Transactional
    void deleteByUser_IdAndFavoriteUser_Id(UUID userId, UUID favoriteUserId);
}