# Portfolio — Frontend

Giao diện portfolio cá nhân, nói chuyện với backend Spring Boot ở `../PortfolioBE`.

React 19 · TypeScript · Vite 8 · react-router v7 · Tailwind CSS v4 · oxlint

## Chạy dự án

```bash
npm install
npm run dev      # http://localhost:5173
```

Backend phải chạy song song ở `http://localhost:8080` thì trang dự án và form liên hệ
mới có dữ liệu.

| Lệnh                   | Việc                                                        |
| ---------------------- | ----------------------------------------------------------- |
| `npm run dev`          | Server dev, có HMR                                           |
| `npm run build`        | Kiểm kiểu bằng `tsc -b` rồi build ra `dist/`                 |
| `npm run preview`      | Xem thử bản build                                            |
| `npm run lint`         | oxlint                                                       |
| `npm run build:sitemap`| Sinh `public/sitemap.xml` — **cần backend đang chạy**        |

## Biến môi trường

| File                | Biến           | Giá trị                                    |
| ------------------- | -------------- | ------------------------------------------ |
| `.env.development`  | `VITE_API_URL` | `http://localhost:8080`                    |
| `.env.production`   | `VITE_API_URL` | `https://portfolio-o7le.onrender.com`      |

Script sinh sitemap đọc biến riêng của Node (không phải `VITE_*`):

```bash
API_URL=http://localhost:8080 SITE_URL=https://domain-cua-ban npm run build:sitemap
```

## Việc cần làm bằng tay

- **`public/cv.pdf`** — nút "Tải CV" ở footer trỏ tới `/cv.pdf`. Chưa bỏ file vào thì nút
  sẽ 404.
- **`public/og-image.png`** — ảnh xem trước khi chia sẻ link (khuyến nghị 1200×630).
- **`public/robots.txt`** — thay `https://your-domain.example` bằng domain thật.
- **`index.html`** — `og:image` đang là đường dẫn tương đối; đổi sang URL tuyệt đối sau
  khi có domain, vì nhiều nơi crawl không hiểu đường dẫn tương đối.
- **`src/config/site.ts`** — tên, nghề, giới thiệu, danh sách kỹ năng, link GitHub và
  LinkedIn (đang để trang chủ của hai site đó).

## Cấu trúc thư mục

```
src/
  api/          client.ts (fetch + ApiError) và một file cho mỗi domain:
                projects, auth, contacts, media
  components/
    ui/         Button, Input, Textarea, Select, Field, Spinner,
                Skeleton, EmptyState, ErrorState
    admin/      ImageUploadField
                ConfirmDialog, ErrorBoundary, ProjectCard, StatusBadge
  config/       site.ts — mọi thứ cần sửa để đổi thông tin cá nhân
  context/      auth.ts + AuthProvider.tsx, unread.ts + UnreadProvider.tsx
                (context và hook tách khỏi component để Fast Refresh hoạt động)
  hooks/        useAsync (loading/error/data/refetch), useDocumentTitle
  layouts/      PublicLayout, AdminLayout
  lib/          authStorage, cn, format, slugify, validation
  pages/        public/ và admin/, cùng NotFoundPage, RouteErrorPage
  routes/       RequireAuth, ScrollToTop
scripts/        gen-sitemap.mjs
```

## Vài quyết định đáng nhớ

- **Router dạng data router** (`createBrowserRouter`) chứ không phải `<BrowserRouter>`,
  vì `useBlocker` — dùng để chặn rời trang khi form dự án còn thay đổi chưa lưu — chỉ
  chạy trên data router.
- **Phiên đăng nhập** nằm trong `localStorage` dưới một key duy nhất `portfolio.auth`,
  kèm `expiresAt`. `AuthProvider` hẹn giờ đăng xuất đúng lúc hết hạn và kiểm lại mỗi khi
  quay lại tab. Ngoài ra `client.ts` gặp 401 cũng xoá phiên và đẩy về `/admin/login`.
- **Sửa dự án phải tải cả danh sách rồi lọc theo id**, vì backend chưa có
  `GET /api/admin/projects/{id}`. Không dùng endpoint public theo slug được: project
  `DRAFT` sẽ không trả về.
- **Nội dung dự án render an toàn** — tách theo dòng trống thành các thẻ `<p>`, giữ xuống
  dòng bằng `whitespace-pre-line`, không dùng `dangerouslySetInnerHTML`.
- **Màu nhấn đổi ở một chỗ**: khối `@theme` đầu `src/index.css`.

## Kích thước bundle

Đo bằng `npm run build`, đơn vị là kích thước sau gzip:

| Chunk                       | Gzip     | Khi nào tải                 |
| --------------------------- | -------- | --------------------------- |
| `index` (entry)             | 65.8 kB  | mọi trang                   |
| `client` (react-dom)        | 35.3 kB  | mọi trang                   |
| CSS                         | 6.9 kB   | mọi trang                   |
| **Tổng cho khách xem**      | **~108 kB** |                          |
| `AdminProjectFormPage`      | 3.7 kB   | chỉ khi vào form dự án      |
| `AdminProjectsPage`         | 2.7 kB   | chỉ khi vào /admin/projects |
| `AdminContactsPage`         | 2.1 kB   | chỉ khi vào /admin/contacts |
| `AdminLayout`               | 1.4 kB   | mọi trang admin             |
| `LoginPage`                 | 1.2 kB   | chỉ trang đăng nhập         |
| `ConfirmDialog`             | 0.8 kB   | dùng chung trong admin      |

Toàn bộ nhánh `/admin/*` nằm ngoài entry chunk nhờ `React.lazy` — khách vào xem portfolio
không tải một dòng mã quản trị nào.

## Tiếp cận (a11y)

- Chữ thường đạt AA (≥ 4.5:1) trên nền `zinc-950`: `zinc-400` là 7.8:1, `zinc-300` là
  13.5:1, màu nhấn `emerald-400` là 10.4:1. `zinc-500` chỉ đạt 4.1:1 nên không dùng cho
  chữ.
- Mọi ô nhập có `<label htmlFor>`, ô sai có `aria-invalid`, thông báo lỗi có `role="alert"`.
- Có link "Bỏ qua, tới nội dung chính" ở đầu trang công khai.
- Tôn trọng `prefers-reduced-motion` (khai báo ở `src/index.css`).

## Deploy

Build ra tĩnh, host ở đâu cũng được (Vercel, Netlify, Cloudflare Pages):

```bash
npm run build       # dist/
```

Vì đây là SPA, host phải trả `index.html` cho mọi đường dẫn không khớp file tĩnh, nếu không
mở thẳng `/projects` sẽ ra 404.

Sau khi có domain, nhớ hai việc phía backend:

1. Thêm domain vào biến môi trường `APP_CORS_ORIGINS` của backend (ngăn cách bằng dấu
   phẩy), ví dụ `https://domain-cua-ban,http://localhost:5173`.
2. Cập nhật `Sitemap:` trong `public/robots.txt` và chạy lại `npm run build:sitemap` với
   `SITE_URL` đúng.
