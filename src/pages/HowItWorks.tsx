import { Layout } from "@/components/layout";
import { Smartphone, MapPin, CheckCircle2, CreditCard, Bell, Shield, Clock, Package } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const steps = [
  {
    number: "01",
    icon: Smartphone,
    title: "Place Your Order",
    description: "Open our app or website and tell us what you need. Choose from our range of services - delivery, shopping, pickup, bills, or custom errands.",
    details: [
      "Quick order form for instant requests",
      "Schedule for later if needed",
      "Add special instructions",
      "Upload photos or documents",
    ],
  },
  {
    number: "02",
    icon: MapPin,
    title: "Enter Locations",
    description: "Provide pickup and delivery addresses. Our smart system finds the fastest routes and matches you with the nearest available rider.",
    details: [
      "Save frequent addresses",
      "Use GPS for accurate locations",
      "Add multiple stops if needed",
      "Get instant price estimates",
    ],
  },
  {
    number: "03",
    icon: CreditCard,
    title: "Choose Payment",
    description: "Pay securely via M-Pesa, debit/credit card, or your Pro Errands wallet. Business accounts can pay on invoice.",
    details: [
      "M-Pesa integration",
      "Card payments via Stripe",
      "Wallet top-up for quick payments",
      "Monthly invoicing for businesses",
    ],
  },
  {
    number: "04",
    icon: Package,
    title: "We Handle It",
    description: "Our verified rider picks up your items or runs your errand. You can track every step in real-time via the app.",
    details: [
      "Verified and trained riders",
      "Live GPS tracking",
      "Photo confirmations",
      "Secure handling",
    ],
  },
  {
    number: "05",
    icon: Bell,
    title: "Stay Updated",
    description: "Receive real-time notifications via SMS, WhatsApp, email, or push notifications. Know exactly where your order is at all times.",
    details: [
      "SMS updates",
      "WhatsApp notifications",
      "Email confirmations",
      "In-app push alerts",
    ],
  },
  {
    number: "06",
    icon: CheckCircle2,
    title: "Delivered!",
    description: "Your items arrive safely at your doorstep. Rate your experience and earn loyalty points for future discounts.",
    details: [
      "Delivery confirmation",
      "Photo proof of delivery",
      "Rate your rider",
      "Earn loyalty rewards",
    ],
  },
];

const features = [
  {
    icon: Clock,
    title: "Same-Day Delivery",
    description: "Most errands completed within hours, not days.",
  },
  {
    icon: Shield,
    title: "Fully Insured",
    description: "All items are covered during transit.",
  },
  {
    icon: MapPin,
    title: "Real-Time Tracking",
    description: "Know exactly where your order is at all times.",
  },
  {
    icon: CreditCard,
    title: "Flexible Payments",
    description: "Pay via M-Pesa, card, or wallet.",
  },
];

const HowItWorks = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-muted section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              How It Works
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Simple, Fast, Reliable
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Getting your errands done with Pro Errands is straightforward. Here's a detailed look at our process from start to finish.
            </p>
            <Button variant="hero" size="lg" asChild>
              <Link to="/order/start">Start Your First Order</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="space-y-16">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="inline-flex items-center justify-center h-8 px-3 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold rounded-full">
                      Step {step.number}
                    </span>
                  </div>
                  <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                    {step.title}
                  </h2>
                  <p className="text-muted-foreground text-lg mb-6">
                    {step.description}
                  </p>
                  <ul className="space-y-3">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                        <span className="text-foreground">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={index % 2 === 1 ? "lg:order-1" : ""}>
                  <div className="relative">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-12 flex items-center justify-center">
                      <div className="h-32 w-32 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <step.icon className="h-16 w-16 text-primary-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="font-display text-3xl font-bold text-foreground mb-4">
              Why Choose Pro Errands?
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 border border-border text-center"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-secondary-foreground/70 mb-8 max-w-lg mx-auto">
            Join thousands of happy customers who trust Pro Errands for their daily errands.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" size="lg" asChild>
              <Link to="/order/start">Start Your Order</Link>
            </Button>
            <Button variant="hero-outline" size="lg" asChild>
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;
