import { Link } from "react-router-dom";
import { ArrowRight, Building2, Users, Zap, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: Users,
    title: "Dedicated Account Manager",
    description: "Personal support for your business needs",
  },
  {
    icon: Zap,
    title: "API Integration",
    description: "Connect directly to your systems",
  },
  {
    icon: Shield,
    title: "Priority Service",
    description: "Faster pickups and deliveries",
  },
  {
    icon: Building2,
    title: "Custom Pricing",
    description: "Volume discounts and flexible billing",
  },
];

export function BusinessSection() {
  return (
    <section className="section-padding bg-muted">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              For Businesses
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6 leading-tight">
              Scale Your Operations with Pro Errands
            </h2>
            <p className="text-muted-foreground text-lg mb-8">
              Whether you're a small business or a large enterprise, our corporate solutions help you streamline logistics, save time, and delight your customers.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">{feature.title}</div>
                    <div className="text-sm text-muted-foreground">{feature.description}</div>
                  </div>
                </div>
              ))}
            </div>

            <Button variant="hero" size="lg" asChild>
              <Link to="/partners">
                Partner with Us
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>

          {/* Right - Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "200+", label: "Business Partners", color: "from-primary to-accent" },
              { value: "50K+", label: "Monthly Orders", color: "from-success to-primary" },
              { value: "99.5%", label: "Uptime SLA", color: "from-accent to-primary" },
              { value: "24/7", label: "Support", color: "from-primary to-success" },
            ].map((stat, index) => (
              <div
                key={stat.label}
                className={`relative overflow-hidden rounded-2xl p-6 ${
                  index === 0 ? "col-span-2 sm:col-span-1" : ""
                }`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-10`} />
                <div className="relative">
                  <div className="font-display text-4xl font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
