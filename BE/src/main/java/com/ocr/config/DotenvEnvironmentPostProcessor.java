package com.ocr.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

/**
 * Tự động nạp biến môi trường từ file .env vào Spring Environment trước khi ứng dụng khởi chạy.
 * Ưu tiên các biến môi trường thực tế của hệ điều hành/Docker container (System.getenv)
 * trước khi nạp từ file .env.
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        Map<String, Object> envMap = new HashMap<>();

        dotenv.entries().forEach(entry -> {
            // Chỉ nạp từ .env nếu biến môi trường hệ thống chưa được set (giúp Docker/k8s ghi đè dễ dàng)
            if (System.getenv(entry.getKey()) == null) {
                envMap.put(entry.getKey(), entry.getValue());
                if (System.getProperty(entry.getKey()) == null) {
                    System.setProperty(entry.getKey(), entry.getValue());
                }
            }
        });

        if (!envMap.isEmpty()) {
            environment.getPropertySources().addFirst(new MapPropertySource("dotenvProperties", envMap));
        }
    }
}
