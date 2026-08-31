package com.example.Portfolio.service;

import com.example.Portfolio.exception.InvalidFileException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;

@Component
public class ImageValidator {

    private static final long MAX_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_TYPES = Set.of("image/jpeg", "image/png", "image/webp", "image/gif");

    public void validate(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("Chưa chọn file");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new InvalidFileException("File tối đa 5MB");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new InvalidFileException("Chỉ chấp nhận JPEG, PNG, WEBP, GIF");
        }
        if (!hasImageSignature(file.getBytes())) {
            throw new InvalidFileException("Nội dung file không phải ảnh hợp lệ");
        }
    }

    private boolean hasImageSignature(byte[] b) {
        if (b.length < 12)
            return false;

        // JPEG: FF D8 FF
        if ((b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF)
            return true;

        // PNG: 89 50 4E 47
        if ((b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G')
            return true;

        // GIF: "GIF8"
        if (b[0] == 'G' && b[1] == 'I' && b[2] == 'F' && b[3] == '8')
            return true;

        // WEBP: "RIFF" ... "WEBP"
        if (b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P')
            return true;

        return false;
    }
}