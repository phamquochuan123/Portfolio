import { useEffect } from 'react';

export const BASE_TITLE = 'Phạm Quốc Huân — Portfolio';

/** Đặt document.title, trả lại tiêu đề cũ khi rời trang. */
export function useDocumentTitle(title: string | null | undefined) {
    useEffect(() => {
        if (!title) return;
        const previous = document.title;
        document.title = title;
        return () => {
            document.title = previous;
        };
    }, [title]);
}
