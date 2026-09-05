package com.example.Portfolio.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.Portfolio.entity.Tag;

public interface TagRepository extends JpaRepository<Tag, Long> {

    Optional<Tag> findBySlug(String slug);

    List<Tag> findAllByOrderByNameAsc();

    /** Chỉ những tag đang gắn với ít nhất một dự án đã đăng — dùng cho bộ lọc công khai. */
    @Query("""
            select distinct t from Tag t
            join Project p on t member of p.tags
            where p.status = com.example.Portfolio.entity.ProjectStatus.PUBLISHED
            order by t.name asc
            """)
    List<Tag> findAllUsedByPublishedProjects();
}
