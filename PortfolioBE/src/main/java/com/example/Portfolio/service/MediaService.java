package com.example.Portfolio.service;

import java.io.IOException;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.Portfolio.dto.MediaResponse;
import com.example.Portfolio.entity.MediaAsset;
import com.example.Portfolio.entity.Project;
import com.example.Portfolio.exception.ResourceNotFoundException;
import com.example.Portfolio.repository.MediaAssetRepository;
import com.example.Portfolio.repository.ProjectRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class MediaService {

    private final MediaAssetRepository mediaRepository;
    private final ProjectRepository projectRepository;
    private final CloudinaryService cloudinaryService;
    private final ImageValidator imageValidator;

    public MediaResponse upload(MultipartFile file, Long projectId, String altText) throws IOException {
        imageValidator.validate(file);

        var project = projectId == null ? null
                : projectRepository.findById(projectId)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy project id " + projectId));

        var uploaded = cloudinaryService.upload(file, "projects");

        try {
            return persist(uploaded, project, file.getOriginalFilename(), altText);
        } catch (RuntimeException e) {
            log.warn("Lưu database thất bại, đang gỡ file khỏi Cloudinary: {}", uploaded.publicId());
            cloudinaryService.delete(uploaded.publicId());
            throw e;
        }
    }

    protected MediaResponse persist(CloudinaryService.UploadResult uploaded,
            Project project, String originalFilename, String altText) {

        var entity = new MediaAsset();
        entity.setProject(project);
        entity.setPublicId(uploaded.publicId());
        entity.setUrl(uploaded.url());
        entity.setFormat(uploaded.format());
        entity.setWidth(uploaded.width());
        entity.setHeight(uploaded.heigth());
        entity.setBytes(uploaded.bytes());
        entity.setOriginalFilename(originalFilename);
        entity.setAltText(altText);
        entity.setSortOrder(project == null ? 0 : mediaRepository.countByProjectId(project.getId()));

        return MediaResponse.from(mediaRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<MediaResponse> listByProject(Long projectId) {
        return mediaRepository.findByProjectIdOrderBySortOrderAsc(projectId)
                .stream().map(MediaResponse::from).toList();
    }

    @Transactional
    public void delete(Long id) {
        var entity = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy ảnh id " + id));
        entity.setDeleted(true);
        cloudinaryService.delete(entity.getPublicId());

    }

}
