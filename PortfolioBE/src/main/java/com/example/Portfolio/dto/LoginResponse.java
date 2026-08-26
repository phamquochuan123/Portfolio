package com.example.Portfolio.dto;

import com.example.Portfolio.entity.Role;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        String email,
        String fullName,
        Role role) {

}
