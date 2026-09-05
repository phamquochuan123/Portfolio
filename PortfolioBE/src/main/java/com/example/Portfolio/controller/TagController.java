package com.example.Portfolio.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Portfolio.dto.TagResponse;
import com.example.Portfolio.repository.TagRepository;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/tags")
@Tag(name = "Tag cong khai", description = "Khong yeu cau dang nhap")
public class TagController {

    private final TagRepository tagRepository;

    public TagController(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    /** Chỉ trả về tag đang gắn với dự án đã đăng, để bộ lọc không hiện lựa chọn rỗng. */
    @GetMapping
    public List<TagResponse> getTags() {
        return tagRepository.findAllUsedByPublishedProjects()
                .stream()
                .map(TagResponse::from)
                .toList();
    }
}
