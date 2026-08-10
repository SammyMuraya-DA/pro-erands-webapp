import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { CartProvider } from "@/hooks/useCart";
import Index from "./pages/Index";
import HowItWorks from "./pages/HowItWorks";
import ServicePage from "./pages/ServicePage";
import Pricing from "./pages/Pricing";
import Track from "./pages/Track";
import Partners from "./pages/Partners";
import Help from "./pages/Help";
import Contact from "./pages/Contact";
import Blog from "./pages/Blog";
import Drivers from "./pages/Drivers";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import Order from "./pages/Order";
import NotFound from "./pages/NotFound";
import RiderPortal from "./pages/RiderPortal";
import Stores from "./pages/Stores";
import StoreDetail from "./pages/StoreDetail";
import ActiveOrders from "./pages/ActiveOrders";
import Dashboard from "./pages/admin/Dashboard";
import Orders from "./pages/admin/Orders";
import Riders from "./pages/admin/Riders";
import Customers from "./pages/admin/Customers";
import Analytics from "./pages/admin/Analytics";
import Settings from "./pages/admin/Settings";
import UserManagement from "./pages/admin/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="/services/:service" element={<ServicePage />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/track" element={<Track />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/help" element={<Help />} />
              <Route path="/help/*" element={<Help />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:id" element={<Blog />} />
              <Route path="/drivers" element={<Drivers />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/account" element={<Account />} />
              <Route path="/account/*" element={<Account />} />
              <Route path="/order" element={<Order />} />
              <Route path="/order/*" element={<Order />} />
              <Route path="/stores" element={<Stores />} />
              <Route path="/stores/:id" element={<StoreDetail />} />
              <Route path="/orders" element={<ActiveOrders />} />
              <Route path="/rider" element={<RiderPortal />} />
              <Route path="/admin" element={<Dashboard />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/riders" element={<Riders />} />
              <Route path="/admin/customers" element={<Customers />} />
              <Route path="/admin/analytics" element={<Analytics />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
