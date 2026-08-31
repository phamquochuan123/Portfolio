package com.example.Portfolio.entity;

import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "media_assets")
@Getter
@Setter
@SQLRestriction("deleted = false")
public class MediaAsset extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @Column(name = "public_id", nullable = false, length = 255)
    private String publicId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String url;

    @Column(length = 20)
    private String format;

    private Integer width;

    private Integer height;

    private Long bytes;

    @Column(name = "original_filename", length = 255)
    private String originalFilename;

    @Column(name = "alt_text", length = 255)
    private String altText;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder = 0;

}
