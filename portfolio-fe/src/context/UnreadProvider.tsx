import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { getUnreadCount } from '../api/contacts';
import { useAsync } from '../hooks/useAsync';
import { UnreadContext } from './unread';

export function UnreadProvider({ children }: { children: ReactNode }) {
    const { data, refetch } = useAsync(getUnreadCount);
    // Điều chỉnh cục bộ so với con số server trả về, để badge phản ứng ngay.
    const [delta, setDelta] = useState(0);

    const refresh = useCallback(() => {
        setDelta(0);
        refetch();
    }, [refetch]);

    const decrement = useCallback((by = 1) => setDelta((d) => d - by), []);

    const count = Math.max(0, (data?.count ?? 0) + delta);

    const value = useMemo(() => ({ count, refresh, decrement }), [count, refresh, decrement]);

    return <UnreadContext value={value}>{children}</UnreadContext>;
}
