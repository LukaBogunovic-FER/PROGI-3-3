
package com.pictora.backend.repository;

import com.pictora.backend.entity.FavoritePost;
import com.pictora.backend.entity.Post;
import com.pictora.backend.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FavoritePostRepository extends JpaRepository<FavoritePost, UUID> {

    List<FavoritePost> findByUser(UserAccount user);

    Optional<FavoritePost> findByUserAndPost(UserAccount user, Post post);

    boolean existsByUserAndPost(UserAccount user, Post post);

    void deleteByUserAndPost(UserAccount user, Post post);
}
