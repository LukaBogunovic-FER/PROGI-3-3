
package com.pictora.backend.repository;

import com.pictora.backend.entity.Post;
import com.pictora.backend.entity.PostVisibility;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


// Key for future Post and Image Services
public interface PostRepository extends JpaRepository<Post, UUID> {

    // Owner-only (edit, delete, visibility change)
    Optional<Post> findByIdAndUser_Id(UUID postId, UUID userId);

    // User's page: all posts
    List<Post> findAllByUser_IdOrderByCreatedAtDesc(UUID userId);

    // Someone else's page: public posts only
    List<Post> findAllByUser_IdAndVisibilityOrderByCreatedAtDesc(UUID userId, PostVisibility visibility);

    // Global feed
    Page<Post> findByVisibility(PostVisibility visibility, Pageable pageable);

    // One post, visible only if public or owned by the viewer
    @Query("""
            select p from Post p
            where p.id = :postId
              and (p.visibility = com.pictora.backend.entity.PostVisibility.PUBLIC
                   or p.user.id = :viewerId)
            """)
    Optional<Post> findVisibleToViewer(@Param("postId") UUID postId, @Param("viewerId") UUID viewerId);

    boolean existsByImage_Id(UUID imageId);
}
