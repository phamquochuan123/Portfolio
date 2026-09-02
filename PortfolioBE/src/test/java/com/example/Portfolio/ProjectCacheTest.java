package com.example.Portfolio;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.cache.CacheManager;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.Portfolio.repository.ProjectRepository;

@SpringBootTest
@AutoConfigureMockMvc
class ProjectCacheTest {

    @Autowired
    MockMvc mockMvc;
    @MockitoBean
    ProjectRepository repository;
    @Autowired
    CacheManager cacheManager;

    @BeforeEach
    void clear() {
        cacheManager.getCacheNames()
                .forEach(n -> cacheManager.getCache(n).clear());
    }

    @Test
    void goi_hai_lan_chi_cham_database_mot_lan() throws Exception {
        // given: repository tra ve mot project
        // when: goi GET /api/projects/{slug} hai lan
        // then: verify(repository, times(1)).findBySlug(...)
    }
}
