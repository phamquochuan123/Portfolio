import { useCallback, useEffect, useRef, useState } from 'react';

export interface AsyncState<T> {
    data: T | null;
    loading: boolean;
    error: Error | null;
    refetch: () => void;
    /** Cập nhật dữ liệu tại chỗ, không gọi lại API. */
    setData: (updater: T | ((prev: T | null) => T | null)) => void;
}

/**
 * Gói vòng lặp loading / error / data / refetch để mọi trang dùng chung một khuôn.
 * `deps` quyết định khi nào gọi lại — giống mảng phụ thuộc của useEffect.
 */
export function useAsync<T>(fn: () => Promise<T>, deps: unknown[] = []): AsyncState<T> {
    const [data, setDataState] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    // Giữ fn trong ref để không cần đưa nó vào deps của effect.
    const fnRef = useRef(fn);
    fnRef.current = fn;

    // Chỉ kết quả của lần gọi mới nhất mới được ghi vào state.
    const runIdRef = useRef(0);
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    const [tick, setTick] = useState(0);
    const refetch = useCallback(() => setTick((n) => n + 1), []);

    useEffect(() => {
        const runId = ++runIdRef.current;
        setLoading(true);
        setError(null);

        fnRef.current().then(
            (result) => {
                if (runId !== runIdRef.current || !mountedRef.current) return;
                setDataState(result);
                setLoading(false);
            },
            (e: unknown) => {
                if (runId !== runIdRef.current || !mountedRef.current) return;
                setError(e instanceof Error ? e : new Error(String(e)));
                setLoading(false);
            },
        );
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tick, ...deps]);

    const setData = useCallback((updater: T | ((prev: T | null) => T | null)) => {
        setDataState((prev) =>
            typeof updater === 'function' ? (updater as (p: T | null) => T | null)(prev) : updater,
        );
    }, []);

    return { data, loading, error, refetch, setData };
}
