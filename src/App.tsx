import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider, MutationCache } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ScrollToTop } from "@/components/ScrollToTop";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import PageViewTracker from "@/components/PageViewTracker";
import DynamicFavicon from "@/components/DynamicFavicon";
import DynamicManifest from "@/components/DynamicManifest";
import { lazy, Suspense } from "react";
import { ActivityTrackerWrapper as ActivityTracker } from "@/components/ActivityTracker";

// Eagerly loaded (homepage + common)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy loaded pages
const PostPage = lazy(() => import("./pages/PostPage"));
const PostsList = lazy(() => import("./pages/PostsList"));
const PageView = lazy(() => import("./pages/PageView"));
const Contact = lazy(() => import("./pages/Contact"));
const NoticeView = lazy(() => import("./pages/NoticeView"));
const LeaderDetail = lazy(() => import("./pages/LeaderDetail"));
const StudentDirectory = lazy(() => import("./pages/StudentDirectory"));
const ResultCheck = lazy(() => import("./pages/ResultCheck"));
const BranchList = lazy(() => import("./pages/BranchList"));
const BranchDetail = lazy(() => import("./pages/BranchDetail"));
const BookStore = lazy(() => import("./pages/BookStore"));
const BookDetail = lazy(() => import("./pages/BookDetail"));
const CartPage = lazy(() => import("./pages/CartPage"));
const Checkout = lazy(() => import("./pages/Checkout"));
const CustomerLogin = lazy(() => import("./pages/CustomerLogin"));
const CustomerRegister = lazy(() => import("./pages/CustomerRegister"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const CustomerResetPassword = lazy(() => import("./pages/CustomerResetPassword"));
const OAuthBridge = lazy(() => import("./pages/OAuthBridge"));
const OAuthCallback = lazy(() => import("./pages/OAuthCallback"));
const Install = lazy(() => import("./pages/Install"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const AppSettings = lazy(() => import("./pages/AppSettings"));
const AppContact = lazy(() => import("./pages/AppContact"));
const QuranPage = lazy(() => import("./pages/QuranPage"));
const HadithPage = lazy(() => import("./pages/HadithPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const TeacherDirectory = lazy(() => import("./pages/TeacherDirectory"));
const TeacherApply = lazy(() => import("./pages/TeacherApply"));
const Advertise = lazy(() => import("./pages/Advertise"));
const InstitutionRegister = lazy(() => import("./pages/InstitutionRegister"));
const QuizHome = lazy(() => import("./pages/QuizHome"));
const QuizLevels = lazy(() => import("./pages/QuizLevels"));
const QuizPlay = lazy(() => import("./pages/QuizPlay"));
const NearbyMap = lazy(() => import("./pages/NearbyMap"));
const QiblaCompass = lazy(() => import("./pages/QiblaCompass"));
const ZakatCalculator = lazy(() => import("./pages/ZakatCalculator"));
const JobApply = lazy(() => import("./pages/JobApply"));
const TeacherDetail = lazy(() => import("./pages/TeacherDetail"));
const JobDetail = lazy(() => import("./pages/JobDetail"));
const ShareRedirect = lazy(() => import("./pages/ShareRedirect"));
const TermsPage = lazy(() => import("./pages/TermsPage"));
const PrivacyPage = lazy(() => import("./pages/PrivacyPage"));
const BranchDashboard = lazy(() => import("./pages/BranchDashboard"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const AssignedTeachers = lazy(() => import("./pages/AssignedTeachers"));
const FAQPage = lazy(() => import("./pages/FAQPage"));

// Lazy Islamic pages
const DuaPage = lazy(() => import("./pages/IslamicPages").then(m => ({ default: m.DuaPage })));
const MasalaPage = lazy(() => import("./pages/IslamicPages").then(m => ({ default: m.MasalaPage })));
const IslamicContentDetail = lazy(() => import("./pages/IslamicContentDetail"));

const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  }),
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      staleTime: 0,
      gcTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
});

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
  </div>
);

const App = () => (
  <HelmetProvider>
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToTop />
        <AuthProvider>
          <CartProvider>
            <PageViewTracker />
            <ActivityTracker />
            <DynamicFavicon />
            <DynamicManifest />
            <Suspense fallback={<PageLoader />}>
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
                <Route path="/install" element={<Install />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/app-settings" element={<AppSettings />} />
                <Route path="/app-contact" element={<AppContact />} />
                <Route path="/quran" element={<QuranPage />} />
                <Route path="/hadith" element={<HadithPage />} />
                <Route path="/dua" element={<DuaPage />} />
                <Route path="/masala" element={<MasalaPage />} />
                <Route path="/quran/:id" element={<IslamicContentDetail />} />
                <Route path="/hadith/:id" element={<IslamicContentDetail />} />
                <Route path="/dua/:id" element={<IslamicContentDetail />} />
                <Route path="/masala/:id" element={<IslamicContentDetail />} />
                <Route path="/teachers" element={<TeacherDirectory />} />
                <Route path="/teacher/:id" element={<TeacherDetail />} />
                <Route path="/job/:id" element={<JobDetail />} />
                <Route path="/teacher-apply" element={<TeacherApply />} />
                <Route path="/assigned-teachers" element={<AssignedTeachers />} />
                <Route path="/advertise" element={<Advertise />} />
                <Route path="/institution-register" element={<InstitutionRegister />} />
                <Route path="/quiz" element={<QuizHome />} />
                <Route path="/quiz/:slug" element={<QuizLevels />} />
                <Route path="/quiz/:slug/play/:levelId" element={<QuizPlay />} />
                <Route path="/nearby-map" element={<NearbyMap />} />
                <Route path="/qibla" element={<QiblaCompass />} />
                <Route path="/zakat" element={<ZakatCalculator />} />
                <Route path="/job-apply/:jobId" element={<JobApply />} />
                <Route path="/branch-dashboard" element={<BranchDashboard />} />
                <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                <Route path="/share/:type/:id" element={<ShareRedirect />} />
                <Route path="/share/:type/:category/:id" element={<ShareRedirect />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/reset-password" element={<ResetPassword />} />
                <Route path="/admin/*" element={<AdminDashboard />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
