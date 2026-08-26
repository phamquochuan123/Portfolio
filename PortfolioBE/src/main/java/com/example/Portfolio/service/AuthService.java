package com.example.Portfolio.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.Portfolio.dto.LoginRequest;
import com.example.Portfolio.dto.LoginResponse;
import com.example.Portfolio.entity.User;
import com.example.Portfolio.exception.InvalidCredentialsException;
import com.example.Portfolio.repository.UserRepository;

@Service
public class AuthService {

    private static final String GENERIC_ERROR = "Email hoặc mật khẩu không đúng";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new InvalidCredentialsException(GENERIC_ERROR));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new InvalidCredentialsException(GENERIC_ERROR);
        }
        String token = jwtService.generateToken(user);
        return new LoginResponse(
                token,
                "Bearer",
                jwtService.getExpirationSeconds(),
                user.getEmail(),
                user.getFullName(),
                user.getRole());
    }

}
