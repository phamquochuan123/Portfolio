/**
 * Sinh public/sitemap.xml từ danh sách project công khai.
 *
 *   API_URL=http://localhost:8080 SITE_URL=https://domain-cua-ban npm run build:sitemap
 *
 * Script này cần backend đang chạy nên KHÔNG được nối vào npm run build.
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const API_URL = (process.env.API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
const SITE_URL = (process.env.SITE_URL ?? 'https://your-domain.example').replace(/\/$/, '');

const STATIC_PATHS = [
    { path: '/', priority: '1.0', changefreq: 'monthly' },
    { path: '/projects', priority: '0.8', changefreq: 'weekly' },
    { path: '/contact', priority: '0.5', changefreq: 'yearly' },
];

const escapeXml = (s) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** LocalDateTime "2026-09-05T14:30:00" → "2026-09-05" */
const toDateOnly = (value) => (typeof value === 'string' ? value.slice(0, 10) : null);

function urlEntry({ path, lastmod, priority, changefreq }) {
    return [
        '  <url>',
        `    <loc>${escapeXml(SITE_URL + path)}</loc>`,
        lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
        changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
        priority ? `    <priority>${priority}</priority>` : null,
        '  </url>',
    ]
        .filter(Boolean)
        .join('\n');
}

async function main() {
    const endpoint = `${API_URL}/api/projects`;
    const res = await fetch(endpoint);
    if (!res.ok) {
        throw new Error(`${endpoint} trả về ${res.status}. Backend đã chạy chưa?`);
    }
    const projects = await res.json();

    const entries = [
        ...STATIC_PATHS.map(urlEntry),
        ...projects.map((p) =>
            urlEntry({
                path: `/projects/${p.slug}`,
                lastmod: toDateOnly(p.publishedAt),
                priority: '0.7',
                changefreq: 'monthly',
            }),
        ),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;

    const out = resolve(dirname(fileURLToPath(import.meta.url)), '../public/sitemap.xml');
    await writeFile(out, xml, 'utf8');
    console.log(`Đã ghi ${out} — ${projects.length} dự án, tổng ${entries.length} URL.`);
    if (SITE_URL.includes('your-domain.example')) {
        console.warn('Cảnh báo: SITE_URL còn là giá trị mẫu. Đặt SITE_URL trước khi deploy.');
    }
}

main().catch((err) => {
    console.error('Sinh sitemap thất bại:', err.message);
    process.exit(1);
});
