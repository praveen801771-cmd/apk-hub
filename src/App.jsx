import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import BackgroundCanvas from './components/BackgroundCanvas';

// Pages
import HomePage from './pages/HomePage';
import AppsPage from './pages/AppsPage';
import CategoryPage from './pages/CategoryPage';
import AppDetailsPage from './pages/AppDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin
import AdminLogin from './admin/AdminLogin';
import AdminAuthGuard from './admin/AdminAuthGuard';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminAppList from './admin/AdminAppList';
import AdminAppForm from './admin/AdminAppForm';
import AdminCategories from './admin/AdminCategories';

export default function App() {
  return (
    <>
      <BackgroundCanvas />
      <Navbar />

      <Routes>
        {/* Public Storefront Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/apps" element={<AppsPage />} />
        <Route path="/categories/:slug" element={<CategoryPage />} />
        <Route path="/apk/:slug" element={<AppDetailsPage />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminAuthGuard>
              <AdminLayout />
            </AdminAuthGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="apps" element={<AdminAppList />} />
          <Route path="apps/new" element={<AdminAppForm />} />
          <Route path="apps/edit/:id" element={<AdminAppForm />} />
          <Route path="categories" element={<AdminCategories />} />
        </Route>

        {/* 404 Fallback */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      <Footer />
      <BottomNav />
    </>
  );
}
