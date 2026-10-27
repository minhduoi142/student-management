package com.ocr.service;

import com.ocr.dto.request.LoginRequest;
import com.ocr.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);
}
