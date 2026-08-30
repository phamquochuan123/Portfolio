package com.example.Portfolio.controller;

import java.net.http.HttpRequest;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.Portfolio.dto.ContactRequest;
import com.example.Portfolio.service.ContactService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/contacts")
@RequiredArgsConstructor
@Tag(name = "Contact công khai", description = "Form liên hệ, không yêu cầu đăng nhập")
public class ContactController {

    private final ContactService contactService;

    @Operation(summary = "Gửi tin nhắn liên hệ")
    @PostMapping
    public ResponseEntity<Map<String, Object>> create(@Valid @RequestBody ContactRequest request,
            HttpServletRequest httpRequest) {

        Long id = contactService.create(request, resolveIp(httpRequest));

        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                "id", id,
                "message", "Đã nhận được tin nhắn của bạn, cảm ơn!"));
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }

        return request.getRemoteAddr();
    }

}
