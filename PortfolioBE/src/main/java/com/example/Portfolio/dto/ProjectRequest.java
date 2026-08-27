package com.example.Portfolio.dto;

import com.example.Portfolio.entity.ProjectStatus;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ProjectRequest(

        @NotBlank(message = "Tiêu đề không được để trống") @Size(max = 255, message = "Tiêu đề tối đa 255 ký tự") String title,

        @NotBlank(message = "không được để trống") @Size(max = 255, message = "Slug tối đa 255 ký tự") @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Chỉ gồm chữ thường, số và dấu gạch ngang") String slug,

        @Size(max = 500, message = "Tóm tắt tối đa 500 ký tự") String summary,

        String content,

        @Size(max = 500) String thumbnailUrl,

        @Size(max = 500) String demoUrl,

        @Size(max = 500) String repoUrl,

        @NotNull(message = "Trạng thái không được để trống") ProjectStatus status

) {

}
