INSERT INTO projects (
        title,
        slug,
        summary,
        content,
        role,
        tech_stack,
        features,
        repo_url,
        status,
        published_at
    )
VALUES (
        'Online Travel Management System',
        'online-travel-management-system',
        'Nen tang dat tour, khach san va nha hang trong mot he thong thong nhat',
        'He thong quan ly du lich truc tuyen cho phep nguoi dung tim kiem va dat tour, phong khach san, ban an tai nha hang. Xay dung theo kien truc phan tang voi Spring Boot, tich hop cong thanh toan VNPay va he thong phan quyen ba cap.',
        'Backend Developer',
        'Java,Spring Boot 3,Spring Security,Spring Data JPA,MySQL,Redis,JWT,VNPay,Cloudinary,Postman',
        'Phan quyen admin/staff/user,Dat tour va khach san trong mot don hang,Tich hop VNPay thanh toan an toan,Quan ly don hang va ma giam gia,Dashboard thong ke doanh thu,Xuat bao cao PDF va Excel',
        'https://github.com/phamquochuan123',
        'PUBLISHED',
        now()
    ),
    (
        'Job Search Website',
        'job-search-website',
        'Nen tang tim kiem viec lam dua tren web',
        'Ung dung ho tro nguoi dung tim kiem viec lam theo ky nang, nhan email thong bao tu dong khi co tin phu hop, va theo doi trang thai ung tuyen.',
        'Backend Developer',
        'Java,Spring Boot,MySQL,React,TypeScript,Git,GitHub,Axios,JWT',
        'Tim kiem viec lam theo ky nang,Gui email tu dong khi co tin phu hop,Theo doi trang thai ung tuyen,Bao mat xac thuc va du lieu',
        'https://github.com/phamquochuan123',
        'PUBLISHED',
        now()
    ),
    (
        'Portfolio Management System',
        'portfolio-management-system',
        'He thong quan ly portfolio ca nhan voi backend Spring Boot',
        'Du an dang phat trien...',
        'Full-stack Developer',
        'Java 21,Spring Boot,Spring Security,PostgreSQL,Redis,Docker,React,TypeScript',
        'Quan ly du an va bai viet,Xac thuc JWT voi refresh token,Cache va dem luot xem bang Redis,Trien khai bang Docker tren VPS',
        'https://github.com/phamquochuan123',
        'DRAFT',
        NULL
    );