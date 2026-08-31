package com.example.Portfolio.controller;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.Portfolio.dto.MediaResponse;
import com.example.Portfolio.service.MediaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/media")
@RequiredArgsConstructor
@Tag(name = "Admin - Media", description = "Tải anh lên Cloudiary, yêu cầu ROLE_ADMIN")
@SecurityRequirement(name = "bearerAuth")
public class AdminMediaController {

    private final MediaService mediaService;

    @Operation(summary = "Tải ảnh lên")
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaResponse> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(required = false) Long projectId,
            @RequestParam(required = false) String altText) throws IOException {

        var result = mediaService.upload(file, projectId, altText);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);

    }

    @Operation(summary = "Danh sách ảnh của một project")
    @GetMapping("/project/{projectId}")
    public List<MediaResponse> listByProject(@PathVariable Long projectId) {
        return mediaService.listByProject(projectId);
    }

    @Operation(summary = "Xoá ảnh")
    @DeleteMapping("{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mediaService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
