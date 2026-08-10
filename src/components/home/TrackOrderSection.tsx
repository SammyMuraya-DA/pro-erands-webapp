import { useState } from "react";
import { Search, Package, MapPin, Clock, CheckCircle2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TrackOrderSection() {
  const [trackingId, setTrackingId] = useState("");
  const [isTracking, setIsTracking] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      setIsTracking(true);
    }
  };

  return (
    <section className="section-padding bg-secondary text-secondary-foreground">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Real-Time Tracking
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Track Your Order
            </h2>
            <p className="text-secondary-foreground/70 text-lg max-w-xl mx-auto">
              Enter your order ID to see exactly where your errand is. Get real-time updates via SMS, WhatsApp, or email.
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleTrack} className="max-w-xl mx-auto mb-12">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your order ID (e.g., PE-12345)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="pl-12 h-14 bg-secondary-foreground/10 border-secondary-foreground/20 text-secondary-foreground placeholder:text-secondary-foreground/50 text-base"
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="h-14 px-8">
                Track
              </Button>
            </div>
          </form>

          {/* Demo Tracking Status */}
          {isTracking && (
            <div className="bg-background/10 backdrop-blur-sm rounded-2xl p-8 animate-fade-in">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-sm text-secondary-foreground/70">Order ID</div>
                  <div className="font-display text-xl font-bold">{trackingId.toUpperCase() || "PE-12345"}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-secondary-foreground/70">Estimated Arrival</div>
                  <div className="font-display text-xl font-bold text-primary">15 minutes</div>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="relative">
                {/* Progress Bar */}
                <div className="absolute top-5 left-5 right-5 h-1 bg-secondary-foreground/20 rounded-full">
                  <div className="h-full w-3/4 bg-gradient-to-r from-primary to-accent rounded-full" />
                </div>

                <div className="relative grid grid-cols-4 gap-4">
                  {[
                    { icon: Package, label: "Order Placed", time: "10:30 AM", done: true },
                    { icon: CheckCircle2, label: "Picked Up", time: "10:45 AM", done: true },
                    { icon: Truck, label: "In Transit", time: "11:00 AM", done: true, active: true },
                    { icon: MapPin, label: "Delivered", time: "11:15 AM", done: false },
                  ].map((step, index) => (
                    <div key={step.label} className="flex flex-col items-center text-center">
                      <div
                        className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center ${
                          step.done
                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground"
                            : "bg-secondary-foreground/20 text-secondary-foreground/50"
                        } ${step.active ? "ring-4 ring-primary/30" : ""}`}
                      >
                        <step.icon className="h-5 w-5" />
                      </div>
                      <div className="mt-3">
                        <div className={`text-sm font-medium ${step.done ? "text-secondary-foreground" : "text-secondary-foreground/50"}`}>
                          {step.label}
                        </div>
                        <div className="text-xs text-secondary-foreground/50">{step.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rider Info */}
              <div className="mt-8 flex items-center justify-between p-4 bg-secondary-foreground/10 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                    JK
                  </div>
                  <div>
                    <div className="font-semibold">John Kariuki</div>
                    <div className="text-sm text-secondary-foreground/70">Your Rider</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="hero-outline" size="sm">
                    Call
                  </Button>
                  <Button variant="hero" size="sm">
                    Message
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
