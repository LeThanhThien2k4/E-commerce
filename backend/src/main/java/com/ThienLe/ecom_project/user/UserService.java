package com.ThienLe.ecom_project.user;

import com.ThienLe.ecom_project.auth.JWTService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor // CHUẨN MODULAR: Thay thế hoàn toàn cho @Autowired
public class UserService {
    
    private final UserRepo repo;
    private final JWTService jwtService;
    private final AuthenticationManager authenticationManager;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder(12);
    
    // --- HÀM MỚI BỔ SUNG PHỤC VỤ LUỒNG ORDER ---
    public Long findIdByUsername(String username) {
        return repo.findByUsername(username)
                .map(Users::getId) // Giả định Entity Users của bạn có hàm getId()
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng với username: " + username));
    }

    public Users register(Users user) {
        user.setPassword(encoder.encode(user.getPassword()));
        return repo.save(user);
    }

    public List<Users> getUsers() {
        return repo.findAll();
    }

    public Users addUser(Users user) {
        return repo.save(user);
    }
    
    public String verify(Users user) {
        Authentication authentication =
                authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(user.getUsername(), user.getPassword()));
        if(authentication.isAuthenticated()) {
            return jwtService.generateToken(user.getUsername(), user.getRole().name());
        } else {
            return "Login failed";
        }
    }
    
    public Optional<Users> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken ) {
            return Optional.empty();
        }
        
        String username = authentication.getName();
        System.out.println("Đang tìm user trong DB với tên: " + username);
        return repo.findByUsername(username);
    }
    // --- THÊM HÀM NÀY VÀO USER SERVICE ---
    public Long getCurrentUserId() {
        return getCurrentUser()
                .map(Users::getId) // Tự động bóc tách lấy ID nếu User tồn tại
                .orElseThrow(() -> new RuntimeException("User not authenticated")); // Báo lỗi nếu chưa đăng nhập
    }
}