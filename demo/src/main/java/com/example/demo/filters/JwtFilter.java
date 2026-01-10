package com.example.demo.filters;

import com.example.demo.security.AuthContext;
import com.example.demo.security.AuthUser;
import com.example.demo.services.JwtService;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();

        // PUBLIC
        if (path.startsWith("/api/auth/login")) return true;
        if (path.startsWith("/api/auth/register")) return true;
        if (path.startsWith("/api/auth/logout")) return true;
        if (path.startsWith("/api/permissions")) return true;

        // sve ostalo u /api je protected
        return !path.startsWith("/api/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            chain.doFilter(req, res);
            return;
        }

        try {
            String authHeader = req.getHeader("Authorization");
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                res.setStatus(401);
                res.setContentType(MediaType.APPLICATION_JSON_VALUE);
                res.getWriter().write("{\"error\":\"No token provided\"}");
                return;
            }

            String token = authHeader.substring("Bearer ".length());

            Claims c = jwtService.parseClaims(token);

            Long id = ((Number)c.get("id")).longValue();
            String email = (String)c.get("email");
            String fullName = (String)c.get("fullName");

            AuthContext.set(new AuthUser(id, email, fullName));
            chain.doFilter(req, res);
        } catch (Exception e) {
            res.setStatus(403);
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            res.getWriter().write("{\"error\":\"Invalid token\"}");
        } finally {
            AuthContext.clear();
        }
    }
}
