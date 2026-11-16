
package com.pictora.backend.repository;

import com.pictora.backend.entity.FavoritePost;
import com.pictora.backend.entity.Post;
import com.pictora.backend.entity.PostVisibility;
import com.pictora.backend.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

import org.springframework.transaction.annotation.Transactional;

public interface FavoritePostRepository extends JpaRepository<FavoritePost, UUID> {

    // Only posts that are still public
    List<FavoritePost> findAllByUser_IdAndPost_VisibilityOrderByCreatedAtDesc(
            UUID userId,
            PostVisibility visibility
    );

    boolean existsByUser_IdAndPost_Id(UUID userId, UUID postId);

    @Transactional
    void deleteByUser_IdAndPost_Id(UUID userId, UUID postId);

    // Call before deleting a post
    @Transactional
    void deleteAllByPost_Id(UUID postId);
}