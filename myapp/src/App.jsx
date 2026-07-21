import { Routes, Route } from "react-router-dom";

import Login from "./pages/login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Recommendations from "./pages/Recommendations";
import MCQTest from "./pages/MCQTest";
import CodingPractice from "./pages/CodingPractice";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import TestHistory from "./pages/TestHistory";
import Profile from "./pages/Profile";
import Leaderboard from "./pages/Leaderboard";
import MistakeAnalysis from "./pages/MistakeAnalysis";
import DailyReview from "./pages/DailyReview";
import RetryReview from "./pages/RetryReview";
import Lessons from "./pages/Lessons";
import LessonView from "./pages/LessonView";
import AdminAIGenerator from "./pages/admin/AdminAIGenerator";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLessons from "./pages/admin/AdminLessons";
import AdminStudents from "./pages/admin/AdminStudents";
import AdminBulkImport from "./pages/admin/AdminBulkImport";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminQuestions from "./pages/admin/AdminQuestions";
import AdminExercises from "./pages/admin/AdminExercises";
import AdminChallenges from "./pages/admin/AdminChallenges";
import AdminInterview from "./pages/admin/AdminInterview";
import InterviewPrep from "./pages/InterviewPrep";
import MockInterview from "./pages/MockInterview";
import InterviewDashboard from "./pages/InterviewDashboard";
import InterviewGenerator from "./pages/InterviewGenerator";
import InterviewSession from "./pages/InterviewSession";
import InterviewResults from "./pages/InterviewResults";
import InterviewResult from "./pages/InterviewResult";


function App() {

  return (
    <>
      <Navbar />

      <Routes>

        <Route path="/" element={<Login />} />

        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />




        <Route path="/assessment" element={<Assessment />} />

        <Route
          path="/recommendations"
          element={
            <ProtectedRoute>
              <Recommendations />
            </ProtectedRoute>
          }
        />



        <Route
          path="/mcq"
          element={
            <ProtectedRoute>
              <MCQTest />
            </ProtectedRoute>
          }
        />

        <Route
          path="/coding-practice"
          element={
            <ProtectedRoute>
              <CodingPractice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <TestHistory />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={<Profile />}
        />

        <Route
          path="/leaderboard"
          element={<Leaderboard />}
        />

        <Route
          path="/mistakes"
          element={<h1>Mistake Route Working</h1>}
        />


        <Route
          path="/test"
          element={<h1>TEST PAGE WORKING</h1>}
        />

        <Route
          path="/daily-review"
          element={<DailyReview />}
        />

        <Route
          path="/retry-review"
          element={<RetryReview />}
        />

        <Route
          path="/lessons"
          element={
            <ProtectedRoute>
              <Lessons />
            </ProtectedRoute>
          }
        />

        <Route
          path="/lessons/:lessonId"
          element={
            <ProtectedRoute>
              <LessonView />
            </ProtectedRoute>
          }
        />
      
        <Route
          path="/interview-prep"
          element={
            <ProtectedRoute>
              <InterviewPrep />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mock-interview"
          element={
            <ProtectedRoute>
              <MockInterview />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-dashboard"
          element={
            <ProtectedRoute>
              <InterviewDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-generator"
          element={
            <ProtectedRoute>
              <InterviewGenerator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview-session"
          element={
            <ProtectedRoute>
              <InterviewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-session/:interviewId"
          element={
            <ProtectedRoute>
              <InterviewSession />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-results"
          element={
            <ProtectedRoute>
              <InterviewResults />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-result"
          element={
            <ProtectedRoute>
              <InterviewResult />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-result/:interviewId"
          element={
            <ProtectedRoute>
              <InterviewResult />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/lessons"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLessons />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/students"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminStudents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/import"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminBulkImport />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
  path="/admin/ai-generator"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminAIGenerator />
    </ProtectedRoute>
  }
/>



        <Route
          path="/admin/questions"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminQuestions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/exercises"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminExercises />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/challenges"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminChallenges />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/interview"
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminInterview />
            </ProtectedRoute>
          }
        />

      </Routes>

    </>
  );
}

export default App;