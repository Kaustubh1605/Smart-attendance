package com.smartattend.backend.services;

import com.smartattend.backend.dto.AuthRequest;
import com.smartattend.backend.dto.AuthResponse;
import com.smartattend.backend.dto.RegisterRequest;
import com.smartattend.backend.models.User;
import com.smartattend.backend.repositories.UserRepository;
import com.smartattend.backend.security.JwtUtil;
import com.smartattend.backend.security.UserDetailsImpl;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse register(RegisterRequest request) {
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setRole(User.Role.valueOf(request.getRole().toUpperCase()));

        userRepository.save(user);

        var jwtToken = jwtUtil.generateToken(new UserDetailsImpl(user));
        return new AuthResponse(jwtToken, user.getRole().name(), user.getName());
    }

    public AuthResponse authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow();
                
        var jwtToken = jwtUtil.generateToken(new UserDetailsImpl(user));
        return new AuthResponse(jwtToken, user.getRole().name(), user.getName());
    }
}
