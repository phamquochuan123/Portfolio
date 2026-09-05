package com.example.Portfolio.dto;

import java.util.List;

/** Số liệu tổng hợp cho trang dashboard quản trị. */
public record StatsResponse(

        long projectsTotal,
        long projectsPublished,
        long projectsDraft,
        long projectsArchived,
        long totalViews,

        long contactsTotal,
        long contactsUnread,

        List<TopProject> topProjects,
        /** 14 ngày gần nhất, kể cả ngày không có tin nào (count = 0). */
        List<DailyCount> contactsPerDay

) {
    public record TopProject(Long id, String title, String slug, Long viewCount) {
    }

    public record DailyCount(String date, long count) {
    }
}
