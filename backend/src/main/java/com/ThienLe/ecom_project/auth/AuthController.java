package com.ThienLe.ecom_project.auth;

import com.ThienLe.ecom_project.user.Users;
import com.ThienLe.ecom_project.user.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final UserRepo userRepository;
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Principal principal) {
        Users user = userRepository.findByUsername(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "role", user.getRole().name()
        ));
    }
}