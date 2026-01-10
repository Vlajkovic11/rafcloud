package com.example.demo.responses;

import java.util.List;

public class LoginResponse {
    public boolean success;
    public String message;
    public String token;
    public UserInfo user;

    public static class UserInfo {
        public Long id;
        public String fullName;
        public String email;
        public List<String> permissions;
    }
}