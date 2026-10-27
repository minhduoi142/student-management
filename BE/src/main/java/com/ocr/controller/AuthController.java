package com.ocr.controller;

import com.ocr.dto.request.LoginRequest;
import com.ocr.dto.response.ApiResponse;
import com.ocr.dto.response.LoginResponse;
import com.ocr.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Xác thực & Phân quyền", description = "Các API xác thực JWT, đăng nhập hệ thống và cấp phát Access Token")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(
            summary = "Đăng nhập hệ thống",
            description = "Xác thực username và password, trả về JWT Access Token kèm thông tin role, maSV hoặc maGV"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đăng nhập thành công, trả về Access Token"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu đăng nhập không hợp lệ hoặc tài khoản bị khóa"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Tên đăng nhập hoặc mật khẩu không chính xác")
    })
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success(response, "Đăng nhập thành công"));
    }
}
