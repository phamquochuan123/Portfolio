package com.example.Portfolio.service;

import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.Portfolio.dto.ContactRequest;
import com.example.Portfolio.dto.ContactResponse;
import com.example.Portfolio.dto.PageResponse;
import com.example.Portfolio.entity.ContactMessage;
import com.example.Portfolio.exception.ResourceNotFoundException;
import com.example.Portfolio.repository.ContactMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ContactService {

    private static final Set<String> SORTABLE = Set.of("CreatedAt", "name", "email");
    private static final int MAX_PAGE_SIZE = 100;

    private final ContactMessageRepository repository;

    @Transactional
    public Long create(ContactRequest request, String ipAddress) {
        var entity = new ContactMessage();
        entity.setName(request.name().trim());
        entity.setEmail(request.email().trim().toLowerCase());
        entity.setSubject(request.subject() == null ? null : request.subject().trim());
        entity.setMessage(request.message().trim());
        entity.setIpAddress(ipAddress);
        return repository.save(entity).getId();
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactResponse> list(int page, int size, String sortBy, String direction, Boolean unread) {

        if (!SORTABLE.contains(sortBy)) {
            sortBy = "createdAt";
        }

        size = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        page = Math.max(page, 0);

        var dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        var pageable = PageRequest.of(page, size, Sort.by(dir, sortBy));

        var result = (unread != null && unread)
                ? repository.findByRead(false, pageable)
                : repository.findAll(pageable);

        return PageResponse.from(result, ContactResponse::from);
    }

    @Transactional
    public ContactResponse markAsRead(Long id) {
        var entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tin nhắn id " + id));

        if (!entity.isRead()) {
            entity.setRead(true);
            entity.setReadAt(LocalDateTime.now());
        }
        return ContactResponse.from(entity);
    }

    @Transactional
    public void softDelete(Long id) {
        var entity = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("không tìm thấy tin nhắn id " + id));
        entity.setDeleted(true);
    }

    @Transactional
    public long countUnread() {
        return repository.countByReadFalse();
    }

}
