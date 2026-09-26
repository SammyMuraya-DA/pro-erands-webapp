import { Link } from "react-router-dom";
import { ArrowRight, Package, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-delivery.jpg";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-muted">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-50">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl animate-float" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl animate-float delay-200" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-3xl animate-float delay-400" />
      </div>

      <div className="container-custom relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center py-12 lg:py-20">
          {/* Left Content */}
          <div className="animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Now serving Kitengela, Athi River & surrounding areas
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
              Your Errands,{" "}
              <span className="gradient-text">Delivered</span> Fast
            </h1>

            <p className="text-lg text-muted-foreground mb-8 max-w-lg">
              From grocery runs to document pickups, we handle all your errands so you can focus on what matters most. Fast, reliable, and always on time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Button variant="hero" size="xl" asChild>
                <Link to="/order/start">
                  Start Your Order
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="xl" asChild>
                <Link to="/how-it-works">See How It Works</Link>
              </Button>
            </div>

            {/* Trust Signals */}
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-success" />
                </div>
                <div>
                  <div className="font-semibold">Same-Day</div>
                  <div className="text-muted-foreground">Delivery</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="font-semibold">10,000+</div>
                  <div className="text-muted-foreground">Errands Done</div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <div className="font-semibold">100%</div>
                  <div className="text-muted-foreground">Insured</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative animate-slide-up delay-200">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Pro Errands delivery rider on motorcycle with orange delivery box in Nairobi"
                className="w-full h-auto object-cover"
              />
              {/* Floating Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-background/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-muted-foreground">Your order is</div>
                    <div className="font-display font-bold text-lg text-success">On the way!</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">ETA</div>
                    <div className="font-display font-bold text-lg">12 mins</div>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
