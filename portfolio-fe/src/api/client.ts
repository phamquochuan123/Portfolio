const BASE = import.meta.env.VITE_API_URL;

async function handle<T>(res: Response): Promise<T> {

    if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.message ?? `Lỗi ${res.status}`);
    }
    return res.json();
}

export function get<T>(path: string): Promise<T> {
    return fetch(`${BASE}${path}`).then(handle<T>);
}

export function post<T>(path: string, data: unknown): Promise<T> {
    return fetch(`${BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(handle<T>);

}