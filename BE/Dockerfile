# ==============================================================================
# Multi-stage Dockerfile cho Backend Spring Boot 3 (Java 21) - QLSV
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Build JAR bằng Maven
# ------------------------------------------------------------------------------
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

# Đảm bảo môi trường build Linux & Maven sử dụng UTF-8
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    MAVEN_OPTS="-Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8"

WORKDIR /build

# Tận dụng Docker layer caching: copy pom.xml và pre-fetch dependencies trước
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy toàn bộ mã nguồn và đóng gói ứng dụng (bỏ qua unit tests để tối ưu tốc độ)
COPY src ./src
RUN mvn clean package -DskipTests -B -Dfile.encoding=UTF-8

# ------------------------------------------------------------------------------
# Stage 2: Runtime image tối giản chỉ chứa JRE 21 (~150MB)
# ------------------------------------------------------------------------------
FROM eclipse-temurin:21-jre-alpine AS runner

# Đảm bảo môi trường runtime Linux & JVM sử dụng UTF-8 chuẩn
ENV LANG=C.UTF-8 \
    LC_ALL=C.UTF-8 \
    JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Dfile.encoding=UTF-8 -Dsun.jnu.encoding=UTF-8 -Duser.language=vi -Duser.country=VN -Djava.security.egd=file:/dev/./urandom"

WORKDIR /app

# Tạo non-root user 'spring' để đảm bảo an toàn bảo mật container
RUN addgroup -S spring && adduser -S spring -G spring
USER spring:spring

# Copy file jar đã build từ builder stage
COPY --from=builder --chown=spring:spring /build/target/*.jar app.jar

# Khai báo port mặc định của Backend
EXPOSE 8081

# Khởi chạy ứng dụng
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
