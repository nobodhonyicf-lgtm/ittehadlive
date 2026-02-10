import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/*" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
