package com.example.Portfolio.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.Portfolio.entity.Project;
import com.example.Portfolio.entity.ProjectStatus;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    List<Project> findByStatusOrderByPublishedAtDesc(ProjectStatus status);

    Optional<Project> findBySlug(String slug);

    boolean existsBySlug(String slug);

}
