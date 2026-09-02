package com.example.Portfolio.service;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder}")
    private String rootFolder;

    public UploadResult upload(MultipartFile file, String subFolder) throws IOException {
        Map<?, ?> result = cloudinary.uploader().upload(
                file.getBytes(),
                ObjectUtils.asMap(
                        "folder", rootFolder + "/" + subFolder,
                        "public_id", UUID.randomUUID().toString(),
                        "resource_type", "image",
                        "overwrite", false,
                        "unique_filename", true));

        return new UploadResult(
                (String) result.get("public_id"),
                (String) result.get("secure_url"),
                (String) result.get("format"),
                (Integer) result.get("width"),
                (Integer) result.get("height"),
                ((Number) result.get("bytes")).longValue());
    }

    public void delete(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("invalidate", true));
        } catch (Exception e) {
            log.error("Không xoá được file trên Cloudinary,publicId={}", publicId, e);
        }
    }

    public record UploadResult(
            String publicId, String url, String format,
            Integer width, Integer height, Long bytes) {
    }
}
