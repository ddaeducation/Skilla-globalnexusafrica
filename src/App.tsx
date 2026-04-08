import { useEffect, lazy, Suspense } from "react";
import OfflineIndicator from "@/components/OfflineIndicator";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { fetchBNRRate } from "@/lib/currency";
import { Loader2 } from "lucide-react";

// Eagerly loaded (landing & auth — first paint)
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const Programs = lazy(() => import("./pages/Programs"));
const AllPrograms = lazy(() => import("./pages/AllPrograms"));
const Apply = lazy(() => import("./pages/Apply"));
const SchoolPrograms = lazy(() => import("./pages/SchoolPrograms"));
const SchoolBrochure = lazy(() => import("./pages/SchoolBrochure"));
const Auth = lazy(() => import("./pages/Auth"));
const Admin = lazy(() => import("./pages/Admin"));
const LMS = lazy(() => import("./pages/LMS"));
const CourseDetail = lazy(() => import("./pages/CourseDetail"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const AcceptInstructorInvite = lazy(() => import("./pages/AcceptInstructorInvite"));
const Instructor = lazy(() => import("./pages/Instructor"));
const AcceptCourseInstructorInvite = lazy(() => import("./pages/AcceptCourseInstructorInvite"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Profile = lazy(() => import("./pages/Profile"));
const BecomeInstructor = lazy(() => import("./pages/BecomeInstructor"));
const NoteReader = lazy(() => import("./components/NoteReader"));
const CertificateVerify = lazy(() => import("./pages/CertificateVerify"));
const CorporateTraining = lazy(() => import("./pages/CorporateTraining"));
const CorporateDashboard = lazy(() => import("./pages/CorporateDashboard"));
const AcceptCorporateInvite = lazy(() => import("./pages/AcceptCorporateInvite"));
const Collaborate = lazy(() => import("./pages/Collaborate"));
const Blog = lazy(() => import("./pages/Blog"));
const LearningPaths = lazy(() => import("./pages/LearningPaths"));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    fetchBNRRate();
  }, []);

  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/programs" element={<AllPrograms />} />
            <Route path="/programs/all" element={<AllPrograms />} />
            <Route path="/programs/:type" element={<Programs />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/schools/:school" element={<SchoolPrograms />} />
            <Route path="/schools/:school/brochure" element={<SchoolBrochure />} />
            <Route path="/apply" element={<Apply />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/lms" element={<LMS />} />
            <Route path="/course/:courseId" element={<CourseDetail />} />
            <Route path="/accept-invite" element={<AcceptInvite />} />
            <Route path="/accept-instructor-invite" element={<AcceptInstructorInvite />} />
            <Route path="/accept-course-instructor-invite" element={<AcceptCourseInstructorInvite />} />
            <Route path="/instructor" element={<Instructor />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/become-instructor" element={<BecomeInstructor />} />
            <Route path="/certificate/verify/:certNumber" element={<CertificateVerify />} />
            <Route path="/corporate-training" element={<CorporateTraining />} />
            <Route path="/corporate-dashboard" element={<CorporateDashboard />} />
            <Route path="/accept-corporate-invite" element={<AcceptCorporateInvite />} />
            <Route path="/collaborate" element={<Collaborate />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<Blog />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <NoteReader />
        </Suspense>
        <OfflineIndicator />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
