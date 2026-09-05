package com.example.Portfolio.entity;

import org.hibernate.annotations.SQLRestriction;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "tags")
@SQLRestriction("deleted = false")
public class Tag extends BaseEntity {

    @Column(name = "name", nullable = false, length = 50)
    private String name;

    @Column(name = "slug", nullable = false, length = 50)
    private String slug;

    protected Tag() {
        // Default constructor for JPA
    }

    public Tag(String name, String slug) {
        this.name = name;
        this.slug = slug;
    }
}
