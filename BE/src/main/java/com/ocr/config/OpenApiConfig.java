package com.ocr.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hệ Thống Quản Lý Sinh Viên API")
                        .version("1.0.0")
                        .description("Tài liệu RESTful API cho Hệ thống Quản lý Sinh viên (Nhóm 6 CE02)")
                        .contact(new Contact()
                                .name("Đội ngũ phát triển")
                                .email("support@qlsv.edu.vn"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://springdoc.org")));
    }
}
