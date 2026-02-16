import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
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
import BookStore from "./pages/BookStore";
import BookDetail from "./pages/BookDetail";
import CartPage from "./pages/CartPage";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";
import LeaderDetail from "./pages/LeaderDetail";
import ResetPassword from "./pages/ResetPassword";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerRegister from "./pages/CustomerRegister";
import UserProfile from "./pages/UserProfile";
import CustomerResetPassword from "./pages/CustomerResetPassword";
import OAuthBridge from "./pages/OAuthBridge";
import OAuthCallback from "./pages/OAuthCallback";

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
          <CartProvider>
            <PageViewTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/post/:slug" element={<PostPage />} />
              <Route path="/posts" element={<PostsList />} />
              <Route path="/page/:slug" element={<PageView />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/notice/:id" element={<NoticeView />} />
              <Route path="/leader/:id" element={<LeaderDetail />} />
              <Route path="/students" element={<StudentDirectory />} />
              <Route path="/result" element={<ResultCheck />} />
              <Route path="/branches" element={<BranchList />} />
              <Route path="/branch/:id" element={<BranchDetail />} />
              <Route path="/books" element={<BookStore />} />
              <Route path="/book/:slug" element={<BookDetail />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/login" element={<CustomerLogin />} />
              <Route path="/register" element={<CustomerRegister />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/reset-password" element={<CustomerResetPassword />} />
              <Route path="/oauth-bridge" element={<OAuthBridge />} />
              <Route path="/oauth-callback" element={<OAuthCallback />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/reset-password" element={<ResetPassword />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
