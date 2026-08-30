package com.example.Portfolio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(

        @NotBlank(message = "Vui lòng nhập họ tên") @Size(max = 100, message = "Họ tên tối đa 100 ký tự") String name,

        @NotBlank(message = "Vui lòng nhập email") @Email(message = "Email không đúng định dạng") @Size(max = 255) String email,

        @Size(max = 200, message = "Tiêu đề tối da 200 ký tự") String subject,

        @NotBlank(message = "Vui lòng nhập nội dung") @Size(min = 10, max = 5000, message = "Nội dung từ 10 đến 5000 ký tự") String message) {

}
