package com.ThienLe.ecom_project.config;

import com.ThienLe.ecom_project.auth.JWTService;
import com.ThienLe.ecom_project.user.MyUserDetailService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter{

    @Autowired
    private JWTService jwtService;
    
    
    @Autowired
    MyUserDetailService myUserDetailService;
    
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String authHeader = request.getHeader("Authorization");
        String token = null;
        String username = null;
        try {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
            try {
                username = jwtService.extractUserName(token);
                System.out.println("Username extract từ token: " + username);
            } catch (Exception e) {
                System.out.println("Lỗi khi trích xuất Token: " + e.getMessage());
            }
        }
        if(username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UserDetails userDetails = myUserDetailService.loadUserByUsername(username);
            if(jwtService.validateToken(token, userDetails)) {
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }else {
            System.out.println(">>> Validate THẤT BẠI.");
        }
        }
        } catch (Exception e) {
            System.err.println("JWT Filter Error: " + e.getMessage());
        }
        
        filterChain.doFilter(request, response);
    }
}

