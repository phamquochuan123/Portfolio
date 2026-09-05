package com.example.Portfolio.config;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.JacksonJsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import com.example.Portfolio.dto.ProjectDetailResponse;
import com.example.Portfolio.dto.ProjectSummaryResponse;

import tools.jackson.databind.JavaType;
import tools.jackson.databind.type.TypeFactory;

@Configuration
@EnableCaching
public class CacheConfig implements CachingConfigurer {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    public static final String PROJECTS_LIST = "projects:list";
    public static final String PROJECTS_DETAIL = "projects:detail";

    @Value("${app.cache.ttl-minutes}")
    private long ttlMinutes;

    private RedisCacheConfiguration baseConfig() {
        return RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(ttlMinutes))
                .disableCachingNullValues()
                .prefixCacheNameWith("portfolio::")
                .serializeKeysWith(RedisSerializationContext.SerializationPair
                        .fromSerializer(new StringRedisSerializer()));
    }

    /**
     * Serializer gắn cứng kiểu dữ liệu cho từng cache.
     *
     * KHÔNG dùng RedisSerializer.json() (GenericJacksonJsonRedisSerializer) ở đây:
     * bản Jackson 3 của nó ghi collection ở gốc thành mảng phẳng nhưng khi đọc lại
     * đòi dạng ["typeId", [...]], nên không đọc nổi chính thứ nó vừa ghi. Hậu quả là
     * mọi lần cache hit đều ném SerializationException.
     */
    private RedisCacheConfiguration typedConfig(JavaType type) {
        return baseConfig().serializeValuesWith(RedisSerializationContext.SerializationPair
                .fromSerializer(new JacksonJsonRedisSerializer<>(type)));
    }

    @Bean
    RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        TypeFactory types = TypeFactory.createDefaultInstance();

        Map<String, RedisCacheConfiguration> caches = Map.of(
                PROJECTS_LIST, typedConfig(
                        types.constructCollectionType(List.class, ProjectSummaryResponse.class)),
                PROJECTS_DETAIL, typedConfig(
                        types.constructType(ProjectDetailResponse.class)));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(baseConfig())
                .withInitialCacheConfigurations(caches)
                .build();
    }

    /**
     * Cache hỏng thì ghi log rồi đi tiếp xuống database, tuyệt đối không được ném lỗi
     * ra ngoài. Cache là thứ tăng tốc, không phải thứ được phép làm sập trang công khai.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new CacheErrorHandler() {

            @Override
            public void handleCacheGetError(RuntimeException ex, Cache cache, Object key) {
                log.warn("Đọc cache '{}' key '{}' thất bại, lấy thẳng từ database: {}",
                        cache.getName(), key, ex.getMessage());
                // Vứt luôn bản ghi hỏng để lần sau không vấp lại.
                try {
                    cache.evict(key);
                } catch (RuntimeException evictFailure) {
                    log.warn("Không xoá được key hỏng '{}': {}", key, evictFailure.getMessage());
                }
            }

            @Override
            public void handleCachePutError(RuntimeException ex, Cache cache, Object key, Object value) {
                log.warn("Ghi cache '{}' key '{}' thất bại: {}", cache.getName(), key, ex.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException ex, Cache cache, Object key) {
                log.warn("Xoá cache '{}' key '{}' thất bại: {}", cache.getName(), key, ex.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException ex, Cache cache) {
                log.warn("Dọn cache '{}' thất bại: {}", cache.getName(), ex.getMessage());
            }
        };
    }
}
