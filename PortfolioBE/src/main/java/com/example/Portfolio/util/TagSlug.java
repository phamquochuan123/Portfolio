package com.example.Portfolio.util;

import java.text.Normalizer;
import java.util.Locale;

/** Sinh slug từ tên tag: bỏ dấu tiếng Việt, hạ chữ thường, nối bằng gạch ngang. */
public final class TagSlug {

    private TagSlug() {
    }

    public static String of(String input) {
        if (input == null) {
            return "";
        }
        String noAccent = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replace('đ', 'd')
                .replace('Đ', 'D');

        return noAccent.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("-{2,}", "-")
                .replaceAll("^-|-$", "");
    }
}
