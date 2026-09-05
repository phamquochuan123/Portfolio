package com.example.Portfolio.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Portfolio.dto.StatsResponse;
import com.example.Portfolio.entity.ProjectStatus;
import com.example.Portfolio.repository.ContactMessageRepository;
import com.example.Portfolio.repository.ProjectRepository;

@Service
public class StatsService {

    private final ProjectRepository projectRepository;
    private final ContactMessageRepository contactMessageRepository;

    public StatsService(ProjectRepository projectRepository,
            ContactMessageRepository contactMessageRepository) {
        this.projectRepository = projectRepository;
        this.contactMessageRepository = contactMessageRepository;
    }

    @Transactional(readOnly = true)
    public StatsResponse getStats() {
        List<StatsResponse.TopProject> top = projectRepository.findTop5ByOrderByViewCountDesc()
                .stream()
                .map(p -> new StatsResponse.TopProject(
                        p.getId(), p.getTitle(), p.getSlug(), p.getViewCount()))
                .toList();

        List<StatsResponse.DailyCount> perDay = contactMessageRepository.countPerDayLast14Days()
                .stream()
                .map(row -> new StatsResponse.DailyCount(row.getDay(), row.getTotal()))
                .toList();

        return new StatsResponse(
                projectRepository.count(),
                projectRepository.countByStatus(ProjectStatus.PUBLISHED),
                projectRepository.countByStatus(ProjectStatus.DRAFT),
                projectRepository.countByStatus(ProjectStatus.ARCHIVED),
                projectRepository.sumViewCount(),
                contactMessageRepository.count(),
                contactMessageRepository.countByReadFalse(),
                top,
                perDay);
    }
}
