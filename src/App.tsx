import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import PageViewTracker from "@/components/PageViewTracker";
import Index from "./pages/Index";
import PostPage from "./pages/PostPage";
import PostsList from "./pages/PostsList";
import PageView from "./pages/PageView";
import Contact from "./pages/Contact";
import NoticeView from "./pages/NoticeView";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import StudentDirectory from "./pages/StudentDirectory";
import ResultCheck from "./pages/ResultCheck";
import BranchList from "./pages/BranchList";
import BranchDetail from "./pages/BranchDetail";
import NotFound from "./pages/NotFound";
import ResetPassword from "./pages/ResetPassword";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
});

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <PageViewTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/post/:slug" element={<PostPage />} />
            <Route path="/posts" element={<PostsList />} />
            <Route path="/page/:slug" element={<PageView />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/notice/:id" element={<NoticeView />} />
            <Route path="/students" element={<StudentDirectory />} />
            <Route path="/result" element={<ResultCheck />} />
            <Route path="/branches" element={<BranchList />} />
            <Route path="/branch/:id" element={<BranchDetail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/reset-password" element={<ResetPassword />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
