import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Đưa trang về đầu mỗi khi đổi route. */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
    }, [pathname]);

    return null;
}
