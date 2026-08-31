package com.example.Portfolio.repository;

import com.example.Portfolio.entity.MediaAsset;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaAssetRepository extends JpaRepository<MediaAsset, Long> {

    List<MediaAsset> findByProjectIdOrderBySortOrderAsc(Long projectId);

    int countByProjectId(Long projectId);
}