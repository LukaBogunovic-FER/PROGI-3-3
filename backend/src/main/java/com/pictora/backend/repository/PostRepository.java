
package com.pictora.backend.repository;

import com.pictora.backend.entity.Post;
import com.pictora.backend.entity.PostVisibility;
import com.pictora.backend.entity.UserAccount;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    List<Post> findByUser(UserAccount user);

    List<Post> findByUserAndVisibility(
            UserAccount user,
            PostVisibility visibility
    );

    List<Post> findByVisibility(PostVisibility visibility);
}
