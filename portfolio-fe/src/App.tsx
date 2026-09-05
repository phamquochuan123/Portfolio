import { Suspense, lazy } from 'react';
import { Navigate, Outlet, RouterProvider, createBrowserRouter } from 'react-router-dom';
import { Spinner } from './components/ui/Spinner';
import { AuthProvider } from './context/AuthProvider';
import { PublicLayout } from './layouts/PublicLayout';
import NotFoundPage from './pages/NotFoundPage';
import RouteErrorPage from './pages/RouteErrorPage';
import ContactPage from './pages/public/ContactPage';
import HomePage from './pages/public/HomePage';
import ProjectDetailPage from './pages/public/ProjectDetailPage';
import ProjectListPage from './pages/public/ProjectListPage';
import { RequireAuth } from './routes/RequireAuth';
import { ScrollToTop } from './routes/ScrollToTop';

// Khách xem portfolio không cần tải mã của khu quản trị.
const AdminLayout = lazy(() =>
    import('./layouts/AdminLayout').then((m) => ({ default: m.AdminLayout })),
);
const LoginPage = lazy(() => import('./pages/admin/LoginPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProjectsPage = lazy(() => import('./pages/admin/AdminProjectsPage'));
const AdminProjectFormPage = lazy(() => import('./pages/admin/AdminProjectFormPage'));
const AdminContactsPage = lazy(() => import('./pages/admin/AdminContactsPage'));

function AdminFallback() {
    return (
        <div className="flex min-h-screen items-center justify-center">
            <Spinner size="lg" label="Đang tải khu quản trị" />
        </div>
    );
}

function RootLayout() {
    return (
        <AuthProvider>
            <ScrollToTop />
            <Outlet />
        </AuthProvider>
    );
}

const router = createBrowserRouter([
    {
        element: <RootLayout />,
        errorElement: <RouteErrorPage />,
        children: [
            {
                element: <PublicLayout />,
                children: [
                    { index: true, element: <HomePage /> },
                    { path: 'projects', element: <ProjectListPage /> },
                    { path: 'projects/:slug', element: <ProjectDetailPage /> },
                    { path: 'contact', element: <ContactPage /> },
                ],
            },
            {
                path: 'admin/login',
                element: (
                    <Suspense fallback={<AdminFallback />}>
                        <LoginPage />
                    </Suspense>
                ),
            },
            {
                path: 'admin',
                element: <RequireAuth />,
                children: [
                    {
                        element: (
                            <Suspense fallback={<AdminFallback />}>
                                <AdminLayout />
                            </Suspense>
                        ),
                        children: [
                            { index: true, element: <Navigate to="/admin/dashboard" replace /> },
                            { path: 'dashboard', element: <AdminDashboardPage /> },
                            { path: 'projects', element: <AdminProjectsPage /> },
                            { path: 'projects/new', element: <AdminProjectFormPage /> },
                            { path: 'projects/:id', element: <AdminProjectFormPage /> },
                            { path: 'contacts', element: <AdminContactsPage /> },
                        ],
                    },
                ],
            },
            { path: '*', element: <NotFoundPage /> },
        ],
    },
]);

export default function App() {
    return <RouterProvider router={router} />;
}
