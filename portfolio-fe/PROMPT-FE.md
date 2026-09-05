# Prompt xây dựng Frontend Portfolio

> Cách dùng: mỗi GIAI ĐOẠN là một prompt riêng. Dán từng giai đoạn vào Claude Code,
> chạy xong, kiểm tra bằng phần "Nghiệm thu" rồi mới sang giai đoạn kế tiếp.
> Đừng dán cả file một lần — nó quá lớn cho một lượt làm việc.

---

## PHẦN CHUNG — dán kèm ở đầu mỗi giai đoạn

```
BỐI CẢNH DỰ ÁN

Tôi đang làm portfolio cá nhân. Backend Spring Boot đã xong, giờ làm frontend.

Thư mục FE: portfolio-fe/
Stack đã cài sẵn (KHÔNG thêm thư viện mới nếu tôi không yêu cầu):
- React 19 + TypeScript + Vite 8
- react-router-dom v7
- Tailwind CSS v4 (cấu hình qua @tailwindcss/vite, chỉ có `@import "tailwindcss";` trong src/index.css — KHÔNG có tailwind.config.js, muốn custom token thì dùng @theme trong CSS)
- oxlint

Biến môi trường:
- .env.development → VITE_API_URL=http://localhost:8080
- .env.production  → VITE_API_URL=https://portfolio-o7le.onrender.com

Ngôn ngữ giao diện: tiếng Việt. Code comment tối thiểu, chỉ khi logic không tự rõ.

────────────────────────────────────────
HỢP ĐỒNG API (lấy từ code backend, bám đúng, không tự bịa field)

CÔNG KHAI
GET  /api/projects            → ProjectSummary[]      (chỉ project PUBLISHED)
GET  /api/projects/{slug}     → ProjectDetail
POST /api/contacts            → 201 { id: number, message: string }

AUTH
POST /api/auth/login          → LoginResponse
     body: { email, password }

ADMIN (bắt buộc header Authorization: Bearer <token>)
GET    /api/admin/projects              → ProjectDetail[]   (cả DRAFT/PUBLISHED/ARCHIVED)
POST   /api/admin/projects              → 201 ProjectDetail
PUT    /api/admin/projects/{id}         → ProjectDetail
DELETE /api/admin/projects/{id}         → 204

GET    /api/admin/contacts?page=0&size=20&sortBy=createdAt&direction=desc&unread=true
                                        → PageResponse<ContactResponse>
GET    /api/admin/contacts/unread-count → { count: number }
PATCH  /api/admin/contacts/{id}/read    → ContactResponse
DELETE /api/admin/contacts/{id}         → 204

POST   /api/admin/media                 → 201 MediaResponse
       multipart/form-data: file (bắt buộc)
       query param tuỳ chọn: projectId, altText
       Giới hạn: 5MB/file
GET    /api/admin/media/project/{projectId} → MediaResponse[]
DELETE /api/admin/media/{id}            → 204

────────────────────────────────────────
KIỂU DỮ LIỆU (khớp record DTO của backend)

ProjectStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'    // ARCHIVED có thật, đừng bỏ sót
Role = 'ADMIN' | 'USER'

ProjectSummary  { id, title, slug, summary|null, thumbnailUrl|null, publishedAt|null }
ProjectDetail   { id, title, slug, summary|null, content|null, thumbnailUrl|null,
                  demoUrl|null, repoUrl|null, status, viewCount, publishedAt|null }
ProjectRequest  { title, slug, summary, content, thumbnailUrl, demoUrl, repoUrl, status }
LoginResponse   { accessToken, tokenType, expiresIn, email, fullName, role }
ContactRequest  { name, email, subject, message }
ContactResponse { id, name, email, subject|null, message, read, readAt|null, createdAt }
MediaResponse   { id, url, thumbnailUrl, format, width, height, bytes, altText|null,
                  sortOrder, projectId|null }
PageResponse<T> { items: T[], page, size, totalElements, totalPages, hasNext }
ApiError        { status, code, message, timestamp }

Ngày giờ là LocalDateTime, trả về dạng "2026-09-05T14:30:00" — KHÔNG có timezone,
KHÔNG có chữ Z. Parse thẳng bằng new Date(chuỗi) là được, đừng cộng/trừ offset.

────────────────────────────────────────
RÀNG BUỘC VALIDATION (khớp @Valid backend — validate ở FE cho khớp để user không
phải chờ round-trip mới biết sai)

ContactRequest:
  name    bắt buộc, ≤100
  email   bắt buộc, đúng định dạng email, ≤255
  subject tuỳ chọn, ≤200
  message bắt buộc, 10–5000 ký tự

ProjectRequest:
  title  bắt buộc, ≤255
  slug   bắt buộc, ≤255, regex ^[a-z0-9]+(-[a-z0-9]+)*$
  summary ≤500 | thumbnailUrl ≤500 | demoUrl ≤500 | repoUrl ≤500
  content không giới hạn
  status bắt buộc

LoginRequest: email bắt buộc + đúng định dạng, password bắt buộc

────────────────────────────────────────
MÃ LỖI BACKEND TRẢ VỀ (dùng field `code` để hiện thông báo đúng ngữ cảnh)

400 VALIDATION_FAILED       message dạng "field: lời nhắn: field2: lời nhắn"
400 INVALID_FILE            file không hợp lệ
401 INVALID_CREDENTIALS     sai email/mật khẩu
401 (từ JwtAuthenticationEntryPoint) — token thiếu/hết hạn
403 (từ JwtAccessDeniedHandler)     — không đủ quyền
404 RESOURCE_NOT_FOUND
409 DUPLICATE_RESOURCE      slug trùng
409 DATA_INTEGRITY_VIOLATION
413 File_TOO_LARGE          (đúng, backend viết hoa lẫn lộn như vậy — so sánh code
                             phải không phân biệt hoa thường cho an toàn)

JWT hết hạn sau 3600000ms = 1 giờ (expiresIn tính bằng ms).
```

---

## GIAI ĐOẠN 1 — Nền tảng: client API, routing, layout

```
[Dán PHẦN CHUNG ở trên vào đây]

NHIỆM VỤ

Dựng nền cho FE. Chưa làm giao diện đẹp, chỉ cần đúng cấu trúc và chạy được.

1. Dọn rác từ template Vite
   - Xoá src/App.css, src/assets/react.svg, src/assets/vite.svg
   - Xoá đoạn console.log('BASE = ...') ở đầu src/App.tsx
   - Sửa <title> trong index.html thành tên tôi (để placeholder "Phạm Quốc Huân — Portfolio")

2. Nâng cấp src/api/client.ts
   - Giữ nguyên cách dùng fetch, KHÔNG thêm axios
   - Tự động gắn header Authorization: Bearer <token> khi trong localStorage có token
   - Ném ra một class ApiError mở rộng Error, có thêm `status` và `code`, để chỗ gọi
     phân biệt được lỗi (ví dụ 409 slug trùng khác 400 validate)
   - Bổ sung hàm put, patch, del, và postForm (cho multipart — KHÔNG tự set
     Content-Type khi gửi FormData, để trình duyệt tự sinh boundary)
   - Xử lý response 204 No Content: không gọi res.json(), trả về undefined
   - Khi gặp 401 mà không phải request login: xoá token khỏi localStorage và
     điều hướng về /admin/login (dùng window.location để tránh phụ thuộc router)

3. Tách types
   - src/types/index.ts: bổ sung đủ các kiểu ở mục KIỂU DỮ LIỆU

4. Lớp API theo domain, mỗi file một domain
   - src/api/projects.ts  — public + admin CRUD
   - src/api/auth.ts      — login
   - src/api/contacts.ts  — gửi liên hệ (public) + các hàm admin
   - src/api/media.ts     — upload/list/delete

5. Auth context
   - src/context/AuthContext.tsx: lưu { accessToken, email, fullName, role } vào
     localStorage dưới MỘT key duy nhất "portfolio.auth"
   - Lưu kèm expiresAt = Date.now() + expiresIn, lúc khởi động app nếu đã quá hạn
     thì coi như chưa đăng nhập và xoá sạch
   - Cung cấp: user, isAuthenticated, login(email, password), logout()

6. Routing (src/App.tsx + src/routes)
   Public — bọc trong PublicLayout (header nav + footer):
     /                    HomePage
     /projects            ProjectListPage
     /projects/:slug      ProjectDetailPage
     /contact             ContactPage
   Admin:
     /admin/login         LoginPage          (không có layout admin)
     /admin               → redirect /admin/projects
     /admin/projects      AdminProjectsPage
     /admin/projects/new  AdminProjectFormPage
     /admin/projects/:id  AdminProjectFormPage
     /admin/contacts      AdminContactsPage
   Bắt hết: * → NotFoundPage (404)

   - RequireAuth: bọc mọi route /admin/* trừ login. Chưa đăng nhập → điều hướng
     /admin/login kèm state.from để login xong quay lại đúng chỗ.
   - Đặt scroll về đầu trang mỗi khi đổi route.

7. Component dùng chung — src/components/ui/
   Spinner, EmptyState, ErrorState (có nút "Thử lại"), Button, Input, Textarea, Select

8. Hook src/hooks/useAsync.ts
   Gói lại vòng lặp loading / error / data / refetch, để trang nào cũng dùng chung
   một khuôn thay vì mỗi trang viết lại useEffect + 3 useState.

Ở giai đoạn này mỗi page chỉ cần trả về tên page trong một thẻ h1 là đủ.

NGHIỆM THU
- npm run build không lỗi TypeScript
- npm run lint sạch
- Bấm qua lại đủ mọi route, không trang nào trắng
- Vào /admin/projects khi chưa login → bị đẩy về /admin/login
```

---

## GIAI ĐOẠN 2 — Trang công khai

```
[Dán PHẦN CHUNG ở trên vào đây]

Giai đoạn 1 đã xong: client API, AuthContext, routing, component ui/ cơ bản.
Giờ dựng giao diện thật cho phần công khai.

PHONG CÁCH
- Nền tối: zinc-950, chữ zinc-100, một màu nhấn duy nhất (mặc định emerald-400).
  Định nghĩa token màu bằng @theme trong src/index.css để đổi màu nhấn một chỗ.
- Bố cục gọn: max-width khoảng 1100px, canh giữa, nhiều khoảng trắng.
- Responsive thật: kiểm ở 375px, 768px, 1280px. Không được tràn ngang.
- Chuyển động tiết chế: hover và focus rõ ràng, không hiệu ứng loè loẹt.
- Tôn trọng prefers-reduced-motion.

NHIỆM VỤ

1. PublicLayout
   - Header dính trên cùng, nền mờ khi cuộn. Nav: Trang chủ / Dự án / Liên hệ.
     Link đang active phải nhìn ra được.
   - Mobile: nút hamburger mở menu, bấm link thì tự đóng.
   - Footer: tên, năm, link GitHub + LinkedIn (để hằng số trong src/config/site.ts
     cho tôi sửa sau), nút "Tải CV".
   - Nút Tải CV trỏ tới /cv.pdf trong thư mục public. Tạo sẵn public/.gitkeep-cv
     hoặc ghi chú trong README rằng tôi cần tự bỏ file cv.pdf vào public/.

2. HomePage
   - Hero: tên, một dòng nghề nghiệp, đoạn giới thiệu ngắn, 2 nút
     ("Xem dự án" → /projects, "Liên hệ" → /contact). Dùng ảnh src/assets/hero.png.
   - Mục "Kỹ năng": danh sách chip lấy từ src/config/site.ts (Java, Spring Boot,
     PostgreSQL, Redis, Docker, React, TypeScript...).
   - Mục "Dự án nổi bật": gọi GET /api/projects, hiện 3 cái đầu, kèm link
     "Xem tất cả". Có đủ loading / lỗi / rỗng.

3. ProjectListPage
   - Lưới thẻ project, tự xuống 1 cột ở mobile.
   - ProjectCard: ảnh thumbnail (nếu null thì khối placeholder có chữ cái đầu của
     title), tiêu đề, tóm tắt cắt 2 dòng, ngày publish định dạng dd/MM/yyyy.
   - Ảnh dùng loading="lazy" và có tỉ lệ khung cố định để không giật layout.
   - Trạng thái loading dùng skeleton, không dùng spinner giữa màn hình.
   - Rỗng: "Chưa có dự án nào." Lỗi: ErrorState có nút thử lại.

4. ProjectDetailPage
   - Lấy theo :slug. 404 (code RESOURCE_NOT_FOUND) → hiện giao diện "không tìm thấy
     dự án" ngay trong trang, kèm link quay lại danh sách. Đừng redirect sang /404.
   - Hiện title, ngày, ảnh, summary, content, nút Demo và Source (ẩn nút nếu url null).
   - content là văn bản thô từ DB. Render an toàn: KHÔNG dùng dangerouslySetInnerHTML.
     Tách theo dòng trống thành các đoạn <p>, giữ xuống dòng bằng whitespace-pre-line.
   - Đặt document.title theo tên project, trả lại tiêu đề cũ khi rời trang.

5. ContactPage
   - Form: Họ tên, Email, Tiêu đề (tuỳ chọn), Nội dung.
   - Validate phía client đúng theo ràng buộc ở PHẦN CHUNG, báo lỗi ngay dưới ô,
     chỉ hiện lỗi sau khi ô đó bị blur hoặc sau lần submit đầu.
   - Đếm ký tự cho ô Nội dung (x/5000), cảnh báo khi dưới 10.
   - Đang gửi: khoá nút, đổi chữ thành "Đang gửi...". Chống double-submit.
   - Thành công: hiện thông báo từ backend, xoá trắng form.
   - Lỗi 400 VALIDATION_FAILED: backend nối chuỗi kiểu "field: lời nhắn: field2: ...".
     Tách chuỗi đó, map về đúng ô nếu nhận diện được tên field, không nhận ra thì
     hiện nguyên câu ở đầu form.
   - Chuẩn bị sẵn nhánh 429 (backend sắp thêm rate limit): hiện "Bạn gửi hơi nhiều,
     thử lại sau ít phút."
   - Nhãn <label> gắn đúng htmlFor, ô lỗi có aria-invalid, thông báo lỗi có role="alert".

6. NotFoundPage
   - 404, một câu ngắn, nút về trang chủ.

NGHIỆM THU
- Chạy BE, mở /projects thấy dữ liệu thật từ database
- Tắt BE, mở lại /projects → ErrorState hiện ra, bấm "Thử lại" gọi lại API
- Gửi form liên hệ với nội dung dưới 10 ký tự → chặn ở client
- Gửi form hợp lệ → 201, thấy thông báo thành công, kiểm tra bản ghi trong DB
- Thu cửa sổ xuống 375px, không chỗ nào tràn ngang
- Tab bằng bàn phím qua toàn trang, luôn thấy viền focus
```

---

## GIAI ĐOẠN 3 — Khu vực admin

```
[Dán PHẦN CHUNG ở trên vào đây]

Giai đoạn 1 và 2 đã xong. Giờ làm khu admin.

NHIỆM VỤ

1. LoginPage (/admin/login)
   - Form email + mật khẩu, nút hiện/ẩn mật khẩu.
   - Sai thông tin (401 INVALID_CREDENTIALS): hiện "Email hoặc mật khẩu không đúng."
     KHÔNG nói rõ sai cái nào.
   - Đăng nhập xong quay về location.state.from, không có thì về /admin/projects.
   - Đã đăng nhập rồi mà vào /admin/login → đẩy thẳng vào /admin/projects.

2. AdminLayout
   - Sidebar: Dự án, Tin nhắn (kèm badge số tin chưa đọc từ
     GET /api/admin/contacts/unread-count), nút Đăng xuất, hiện fullName.
   - Mobile: sidebar thu thành drawer.
   - Badge chưa đọc làm thành context nhỏ để trang tin nhắn đánh dấu đã đọc xong
     thì badge tự giảm, không phải load lại trang.

3. AdminProjectsPage (/admin/projects)
   - Bảng: thumbnail nhỏ, title, slug, status (badge màu: DRAFT xám, PUBLISHED xanh,
     ARCHIVED hổ phách), viewCount, publishedAt, cột thao tác.
   - Thao tác: Sửa (→ /admin/projects/:id), Xoá (mở hộp xác nhận, chữ rõ rằng đây là
     xoá mềm), Xem (mở /projects/:slug ở tab mới, chỉ bật khi status = PUBLISHED).
   - Nút "Thêm dự án" → /admin/projects/new.
   - Lọc theo status ở phía client + ô tìm theo title/slug. Backend không có tham số
     lọc, nên lọc trên mảng đã tải.
   - Mobile: bảng chuyển thành danh sách thẻ, đừng để bảng tràn ngang.

4. AdminProjectFormPage (/admin/projects/new và /admin/projects/:id)
   - Cùng một component, phân biệt bằng có :id hay không. Có :id thì lấy dữ liệu từ
     GET /api/admin/projects rồi tìm theo id (backend không có endpoint lấy 1 project
     theo id cho admin — đừng gọi endpoint public theo slug vì DRAFT sẽ không ra).
   - Trường: title, slug, summary, content (textarea cao), thumbnailUrl, demoUrl,
     repoUrl, status (select 3 giá trị).
   - Slug tự sinh từ title khi đang tạo mới và người dùng chưa tự sửa slug:
     bỏ dấu tiếng Việt, hạ chữ thường, thay ký tự lạ bằng gạch ngang, gộp gạch liền
     nhau, cắt gạch ở hai đầu. Đã sửa tay thì dừng tự sinh.
   - Validate client theo đúng ràng buộc backend, có đếm ký tự ở các ô có giới hạn.
   - Lỗi 409 DUPLICATE_RESOURCE → gắn lỗi vào ô slug: "Slug này đã tồn tại."
   - Lưu xong → quay về /admin/projects kèm thông báo thành công.
   - Cảnh báo khi rời trang lúc form còn thay đổi chưa lưu (beforeunload + chặn
     điều hướng trong app).

5. Upload ảnh trong form project
   - Ở cạnh ô thumbnailUrl: nút "Tải ảnh lên" gọi POST /api/admin/media
     (FormData field tên "file"), kèm projectId nếu đang sửa project đã có id.
   - Chặn ở client trước khi gửi: chỉ nhận image/*, tối đa 5MB.
   - Upload xong lấy `url` trả về điền vào ô thumbnailUrl và hiện ảnh xem trước.
   - Có thanh tiến trình hoặc ít nhất trạng thái "Đang tải lên...".
   - Bắt lỗi 413 (code File_TOO_LARGE, so sánh không phân biệt hoa thường) và
     400 INVALID_FILE với thông báo riêng.

6. AdminContactsPage (/admin/contacts)
   - Danh sách phân trang từ PageResponse: dùng items, page, totalPages, hasNext.
     Trang trong URL query (?page=2) để F5 không mất chỗ.
   - Tab "Tất cả" / "Chưa đọc" → gắn tham số unread=true.
   - Tin chưa đọc hiển thị đậm hơn, có chấm tròn màu nhấn.
   - Bấm vào một dòng: mở rộng xem toàn bộ nội dung, đồng thời gọi
     PATCH /api/admin/contacts/{id}/read nếu tin đó chưa đọc, rồi cập nhật state
     tại chỗ và giảm badge chưa đọc.
   - Nút Xoá có hộp xác nhận.
   - Nút "Trả lời" mở mailto: với sẵn địa chỉ và tiêu đề "Re: <subject>".
   - Định dạng thời gian: dưới 24h thì hiện tương đối ("3 giờ trước"), cũ hơn thì
     dd/MM/yyyy HH:mm.

7. Xử lý hết hạn phiên
   - Bất kỳ request admin nào trả 401 → xoá auth, đẩy về /admin/login kèm thông báo
     "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại."
   - Tự kiểm tra expiresAt trước mỗi lần render route admin, hết hạn thì đăng xuất
     luôn, không cần chờ server trả 401.

NGHIỆM THU
- Login sai → báo lỗi; login đúng → vào được /admin/projects
- Tạo project mới → hiện ngay trong danh sách và ở /projects (nếu PUBLISHED)
- Tạo project trùng slug → lỗi gắn đúng ô slug
- Upload ảnh > 5MB → bị chặn ở client
- Đánh dấu tin đã đọc → badge sidebar giảm ngay
- Xoá token trong localStorage rồi bấm một thao tác admin → bị đẩy về login
```

---

## GIAI ĐOẠN 4 — Hoàn thiện

```
[Dán PHẦN CHUNG ở trên vào đây]

Ba giai đoạn trước đã xong. Giờ hoàn thiện.

1. SEO và metadata
   - index.html: title, meta description, og:title, og:description, og:image,
     og:type, twitter:card, thẻ lang="vi"
   - public/robots.txt trỏ tới sitemap
   - Script Node nhỏ (scripts/gen-sitemap.mjs) gọi API lấy danh sách project và
     sinh public/sitemap.xml. Nối vào npm script "build:sitemap", KHÔNG chèn vào
     "build" (build không nên phụ thuộc backend đang chạy).
   - Mỗi trang tự đặt document.title bằng một hook nhỏ useDocumentTitle.

2. Chất lượng UI
   - Error boundary ở gốc cây React, hiện màn hình lỗi tử tế thay vì trang trắng.
   - Rà lại: mọi lời gọi API đều có đủ 4 trạng thái loading / lỗi / rỗng / có dữ liệu.
   - Skeleton cho danh sách project và danh sách tin nhắn.
   - Tất cả ảnh có alt. Ảnh trang trí thì alt="".
   - Kiểm tương phản màu đạt AA cho chữ thường (4.5:1).

3. Hiệu năng
   - React.lazy + Suspense cho toàn bộ nhánh /admin/* (khách vào xem portfolio
     không cần tải code admin).
   - Kiểm kích thước bundle sau khi build, ghi lại con số trong README.

4. README của portfolio-fe
   - Cách chạy, biến môi trường, cấu trúc thư mục, cách deploy,
     nhắc rõ phải bỏ file cv.pdf vào public/.

NGHIỆM THU
- npm run build sạch, không cảnh báo TypeScript
- npm run lint sạch
- Bundle của trang chủ không kèm code admin (kiểm trong output của vite build)
- Dùng riêng bàn phím đi hết được luồng: xem dự án → gửi liên hệ
```

---

## Việc cần sửa ở BACKEND trước khi làm Giai đoạn 3

Ba điểm này sẽ chặn FE, sửa ở `PortfolioBE` chứ không phải ở FE:

1. **CORS thiếu `PATCH`** — `SecurityConfig.corsConfigurationSource()` mới cho phép
   `GET, POST, PUT, DELETE, OPTIONS`. Trang tin nhắn admin gọi
   `PATCH /api/admin/contacts/{id}/read`, trình duyệt sẽ chặn ở bước preflight.
   Thêm `"PATCH"` vào `setAllowedMethods`.

2. **CORS thiếu origin production** — mới chỉ có `http://localhost:5173` và `:5174`.
   Khi deploy FE lên Vercel/Netlify phải thêm domain đó, tốt nhất là đọc từ biến
   môi trường `APP_CORS_ORIGINS` thay vì hằng số trong code.

3. **Admin không có endpoint lấy một project theo id** — form sửa project đang phải
   tải cả danh sách rồi lọc. Chạy được nhưng phí. Nếu muốn gọn thì thêm
   `GET /api/admin/projects/{id}`.

Hai điểm nhỏ hơn, không chặn FE:

- `ContactService.SORTABLE` chứa `"CreatedAt"` viết hoa chữ C, nên tham số
  `sortBy=createdAt` luôn rơi vào nhánh reset. Chạy đúng do trùng giá trị mặc định,
  nhưng là lỗi gõ nhầm.
- Rate limit cho form liên hệ (tuần 3 trong SCOPE.md) chưa làm. FE đã chuẩn bị sẵn
  nhánh xử lý 429 ở Giai đoạn 2.
