package com.example.Portfolio.dto;

import com.example.Portfolio.entity.MediaAsset;

public record MediaResponse(
        Long id,
        String url,
        String thumbnailUrl,
        String format,
        Integer width,
        Integer height,
        Long bytes,
        String altText,
        Integer sortOrder,
        Long projectId) {

    public static MediaResponse from(MediaAsset e) {
        return new MediaResponse(
                e.getId(),
                e.getUrl(),
                buildThumbnail(e.getUrl()),
                e.getFormat(),
                e.getWidth(),
                e.getHeight(),
                e.getBytes(),
                e.getAltText(),
                e.getSortOrder(),
                e.getProject() == null ? null : e.getProject().getId());
    }

    private static String buildThumbnail(String url) {
        return url.replace("/upload/", "/upload/w_400,h_300,c_fill,q_auto,f_auto/");
    }

}
