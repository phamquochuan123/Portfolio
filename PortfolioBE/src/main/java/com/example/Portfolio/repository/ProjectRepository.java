package com.example.Portfolio.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.Portfolio.entity.Project;
import com.example.Portfolio.entity.ProjectStatus;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStatusOrderByPublishedAtDesc(ProjectStatus status);

    @Query("""
            select distinct p from Project p
            join p.tags t
            where p.status = :status and t.slug = :tagSlug
            order by p.publishedAt desc
            """)
    List<Project> findByStatusAndTagSlug(@Param("status") ProjectStatus status,
            @Param("tagSlug") String tagSlug);

    Optional<Project> findBySlug(String slug);

    boolean existsBySlug(String slug);

    long countByStatus(ProjectStatus status);

    List<Project> findTop5ByOrderByViewCountDesc();

    @Query("select coalesce(sum(p.viewCount), 0) from Project p")
    long sumViewCount();

    /**
     * Tăng lượt xem bằng một câu UPDATE thẳng, không đi qua cache của getBySlug —
     * nếu đếm bên trong phương thức @Cacheable thì mọi lần cache hit đều không được đếm.
     */
    @Modifying
    @Query("update Project p set p.viewCount = p.viewCount + 1 where p.slug = :slug and p.status = 'PUBLISHED'")
    int incrementViewCount(@Param("slug") String slug);

}
