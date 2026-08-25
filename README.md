# Portfolio Backend

API quản lý portfolio cá nhân, xây dựng bằng Spring Boot 4 và PostgreSQL.

## Công nghệ

- Java 21, Spring Boot 4
- PostgreSQL 16, Flyway migration
- Redis (cache)
- Docker Compose

## Chạy trên máy

Yêu cầu: Docker Desktop, JDK 21.

```bash
cp .env.example .env
docker compose up -d
./mvnw spring-boot:run
```

API chạy ở `http://localhost:8080`.

## Endpoint hiện có

| Method | Đường dẫn | Mô tả |
|---|---|---|
| GET | `/api/projects` | Danh sách project đã publish |
| GET | `/api/projects/{slug}` | Chi tiết một project |

## Trạng thái

Đang phát triển. Xem [SCOPE.md](SCOPE.md) để biết phạm vi bản 1.0.
