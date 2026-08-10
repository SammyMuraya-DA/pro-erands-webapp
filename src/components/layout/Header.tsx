import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Phone, MapPin, User, LogOut, Shield, ShoppingBag, Package } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useCart } from "@/hooks/useCart";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CartSheet } from "@/components/cart/CartSheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const services = [
  { name: "Same-day Delivery", href: "/services/delivery" },
  { name: "Grocery & Pharmacy", href: "/services/shopping" },
  { name: "Pickup & Drop", href: "/services/pickup-drop" },
  { name: "Bills & Payments", href: "/services/bills-payments" },
  { name: "Errand Concierge", href: "/services/concierge" },
  { name: "Corporate Solutions", href: "/services/corporate" },
];

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Stores", href: "/stores" },
  { name: "How it Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "Track Order", href: "/track" },
  { name: "Help", href: "/help" },
];

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { itemCount } = useCart();

  const isActive = (href: string) => location.pathname === href;
  const isServicesActive = location.pathname.startsWith("/services");

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="container-custom py-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:+254711301315" className="flex items-center gap-1.5 hover:text-primary transition-colors">
              <Phone className="h-3.5 w-3.5" />
              <span>+254 711 301 315</span>
            </a>
            <span className="hidden sm:flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5" />
              <span>Nairobi, Kenya</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/drivers" className="hover:text-primary transition-colors">
              Become a Rider
            </Link>
            <Link to="/blog" className="hidden sm:block hover:text-primary transition-colors">
              Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container-custom">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl">P</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-display font-bold text-xl text-foreground">Pro Errands</span>
              <span className="block text-xs text-muted-foreground -mt-1">Solutions</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
              }`}
            >
              Home
            </Link>

            <Link
              to="/stores"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/stores") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
              }`}
            >
              Stores
            </Link>

            {/* Services Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isServicesActive ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                Services
                <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {services.map((service) => (
                  <DropdownMenuItem key={service.href} asChild>
                    <Link to={service.href} className="w-full cursor-pointer">
                      {service.name}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/pricing"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/pricing") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
              }`}
            >
              Pricing
            </Link>

            <Link
              to="/track"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/track") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
              }`}
            >
              Track Order
            </Link>

            <Link
              to="/help"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/help") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
              }`}
            >
              Help
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {user && (
              <Link
                to="/orders"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1.5 ${
                  isActive("/orders") ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-muted"
                }`}
              >
                <Package className="h-4 w-4" />
                Orders
              </Link>
            )}

            <CartSheet />

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <User className="h-4 w-4" />
                    <span className="max-w-[120px] truncate">
                      {user.email?.split("@")[0]}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="w-full cursor-pointer">
                      <User className="h-4 w-4 mr-2" />
                      My Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="w-full cursor-pointer">
                      <Package className="h-4 w-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full cursor-pointer text-primary">
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="outline" asChild>
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
            <Button variant="hero" asChild>
              <Link to="/stores">
                <ShoppingBag className="h-4 w-4 mr-1" />
                Order Now
              </Link>
            </Button>
          </div>

          {/* Mobile: Cart + Menu */}
          <div className="flex items-center gap-2 lg:hidden">
            <CartSheet />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-border py-4 animate-fade-in">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive(link.href) ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}

              {user && (
                <Link
                  to="/orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    isActive("/orders") ? "text-primary bg-primary/10" : "text-foreground hover:bg-muted"
                  }`}
                >
                  <Package className="h-4 w-4" />
                  My Orders
                </Link>
              )}

              <div className="flex flex-col gap-2 mt-4 px-4">
                {user ? (
                  <>
                    <Button variant="outline" className="w-full" asChild>
                      <Link to="/account" onClick={() => setIsMobileMenuOpen(false)}>
                        <User className="h-4 w-4 mr-2" />
                        My Account
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button variant="outline" className="w-full border-primary text-primary" asChild>
                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full text-destructive" 
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </>
                ) : (
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                  </Button>
                )}
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/stores" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShoppingBag className="h-4 w-4 mr-1" />
                    Order Now
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
