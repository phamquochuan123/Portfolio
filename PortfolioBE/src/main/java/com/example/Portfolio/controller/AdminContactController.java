package com.example.Portfolio.controller;

import com.example.Portfolio.service.ContactService;
import org.springframework.web.bind.annotation.RestController;

import com.example.Portfolio.dto.ContactResponse;
import com.example.Portfolio.dto.PageResponse;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@RestController
@RequestMapping("/api/admin/contacts")
@RequiredArgsConstructor
@Tag(name = "Admin - Contact", description = "")

public class AdminContactController {

    private final ContactService contactService;

    @Operation(summary = "Danh sách tin nhắn, có phân trang")
    @GetMapping
    public PageResponse<ContactResponse> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) Boolean unread) {

        return contactService.list(page, size, sortBy, direction, unread);
    }

    @Operation(summary = "Đếm số tin chưa đọc")
    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount() {
        return Map.of("count", contactService.countUnread());
    }

    @Operation(summary = "Đánh dấu đã đọc")
    @PatchMapping("/{id}/read")
    public ContactResponse markAsRead(@PathVariable Long id) {
        return contactService.markAsRead(id);
    }

    @Operation(summary = "Xoá tin nhắn")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactService.softDelete(id);
        return ResponseEntity.noContent().build();
    }

}
