package com.example.demo.security;

import com.example.demo.model.User;
import com.example.demo.repositories.UserRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class PermissionInterceptor implements HandlerInterceptor {

    private final UserRepository userRepository;

    public PermissionInterceptor(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean preHandle(HttpServletRequest req, HttpServletResponse res, Object handler) throws Exception {
        if ("OPTIONS".equalsIgnoreCase(req.getMethod())) {
            return true;
        }

        if (!(handler instanceof HandlerMethod hm)) return true;

        RequiredPermission rp = hm.getMethodAnnotation(RequiredPermission.class);
        if (rp == null) return true;

        AuthUser auth = AuthContext.get();
        if (auth == null) {
            res.setStatus(401);
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            res.getWriter().write("{\"error\":\"No token provided\"}");
            return false;
        }

        User user = userRepository.findById(auth.id).orElse(null);
        if (user == null) {
            res.setStatus(404);
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            res.getWriter().write("{\"error\":\"User not found\"}");
            return false;
        }

        Set<String> perms = user.getPermissions().stream().map(p -> p.getName()).collect(Collectors.toSet());
        if (!perms.contains(rp.value())) {
            res.setStatus(403);
            res.setContentType(MediaType.APPLICATION_JSON_VALUE);
            res.getWriter().write("{\"error\":\"Missing permission: " + rp.value() + "\"}");
            return false;
        }


        req.setAttribute("dbUser", user);
        return true;
    }
}
