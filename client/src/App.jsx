import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardLayout from './components/layout/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import CoursesPage from './pages/CoursesPage';
import CourseSearchPage from './pages/CourseSearchPage';
import CourseDetailPage from './pages/CourseDetailPage';
import QuizPage from './pages/QuizPage';
import AssessmentPage from './pages/AssessmentPage';
import PersonalizedPage from './pages/PersonalizedPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';
import LearningTrackerPage from './pages/LearningTrackerPage';
import AnalyticsPage from './pages/AnalyticsPage';

import { UIProvider } from './contexts/UIContext';

function App() {
  return (
    <Router>
      <AuthProvider>
        <UIProvider>
          <Routes>

          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Dashboard sub-routes wrapped in the glowing top-nav layout and ProtectedRoute */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardPage />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="search" element={<CourseSearchPage />} />
              <Route path="courses/:id" element={<CourseDetailPage />} />
              <Route path="quiz/:id" element={<QuizPage />} />
              <Route path="assessment/:courseId" element={<AssessmentPage />} />
              <Route path="personalized" element={<PersonalizedPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="admin" element={<AdminPage />} />
              <Route path="tracker" element={<LearningTrackerPage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
            </Route>
          </Route>
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </UIProvider>
      </AuthProvider>
    </Router>
  );
}


export default App;
