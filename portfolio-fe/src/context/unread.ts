import { createContext, useContext } from 'react';

export interface UnreadContextValue {
    count: number;
    /** Gọi lại API đếm tin chưa đọc. */
    refresh: () => void;
    /** Giảm badge tại chỗ sau khi đánh dấu đã đọc, không phải load lại trang. */
    decrement: (by?: number) => void;
}

export const UnreadContext = createContext<UnreadContextValue>({
    count: 0,
    refresh: () => {},
    decrement: () => {},
});

export function useUnread(): UnreadContextValue {
    return useContext(UnreadContext);
}
