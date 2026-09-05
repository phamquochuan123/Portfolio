package com.example.Portfolio.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.Portfolio.entity.ContactMessage;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    Page<ContactMessage> findByRead(boolean read, Pageable pageable);

    long countByReadFalse();

    /**
     * Số tin nhắn theo từng ngày trong 14 ngày gần nhất, kể cả ngày trống.
     * Dùng native query vì generate_series là hàm riêng của PostgreSQL — và vì native
     * query không đi qua @SQLRestriction nên phải tự lọc deleted = false.
     */
    @Query(value = """
            SELECT to_char(d.day, 'YYYY-MM-DD') AS day, COUNT(c.id) AS total
            FROM generate_series(
                     CURRENT_DATE - INTERVAL '13 days', CURRENT_DATE, INTERVAL '1 day'
                 ) AS d(day)
            LEFT JOIN contact_messages c
                   ON c.created_at >= d.day
                  AND c.created_at < d.day + INTERVAL '1 day'
                  AND c.deleted = false
            GROUP BY d.day
            ORDER BY d.day
            """, nativeQuery = true)
    List<DailyCountRow> countPerDayLast14Days();

    /** Projection cho truy vấn thống kê theo ngày. */
    interface DailyCountRow {
        String getDay();

        long getTotal();
    }

}
