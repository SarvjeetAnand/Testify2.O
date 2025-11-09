import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { QuizProvider } from './contexts/QuizContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { LayoutProvider } from './contexts/LayoutContext';


// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import QuizList from './pages/QuizList';
import TakeQuiz from './pages/TakeQuiz';
import Results from './pages/Results';
import Profile from './pages/Profile';
import UserDashboard from './pages/UserDashboard';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageUsers from './pages/admin/ManageUsers';
import ManageQuizzes from './pages/admin/ManageQuizzes';
import ManageQuestions from './pages/admin/ManageQuestions';
import ManageCategories from './pages/admin/ManageCategories';
import ManageCodingProblems from './pages/admin/ManageCodingProblems';
import Analytics from './pages/admin/Analytics';

import './App.css';

function App() {
  return (
    <LayoutProvider>
    <Router>
      <AuthProvider>
        <QuizProvider>
          <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  style: {
                    background: '#10b981',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                  },
                },
              }}
            />
            
            <Header />
            
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected User Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <UserDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/quizzes" element={
                  <ProtectedRoute>
                    <QuizList />
                  </ProtectedRoute>
                } />
                
                <Route path="/quiz/:id" element={
                  <ProtectedRoute>
                    <TakeQuiz />
                  </ProtectedRoute>
                } />
                
                <Route path="/results" element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                } />
                
                <Route path="/results/:id" element={
                  <ProtectedRoute>
                    <Results />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                {/* Protected Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute adminOnly={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/users" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageUsers />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/quizzes" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageQuizzes />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/questions" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageQuestions />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/categories" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageCategories />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/coding-problems" element={
                  <ProtectedRoute adminOnly={true}>
                    <ManageCodingProblems />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/analytics" element={
                  <ProtectedRoute adminOnly={true}>
                    <Analytics />
                  </ProtectedRoute>
                } />
                
                {/* Not Found */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </QuizProvider>
      </AuthProvider>
    </Router>
    </LayoutProvider>
  );
}

export default App;