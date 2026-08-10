import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Building2, Users, Zap, Shield, BarChart3, Headphones, Code, Truck, CheckCircle2, ArrowRight } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Dedicated Account Manager",
    description: "A personal point of contact who understands your business needs and ensures smooth operations.",
  },
  {
    icon: Code,
    title: "API Integration",
    description: "Connect Pro Errands directly to your systems. Automate order creation and tracking.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Detailed reports on delivery times, costs, and performance metrics.",
  },
  {
    icon: Truck,
    title: "Priority Dispatch",
    description: "Your orders get priority placement ensuring faster pickup and delivery.",
  },
  {
    icon: Shield,
    title: "Custom SLA",
    description: "Service level agreements tailored to your specific requirements.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Round-the-clock dedicated support for your business operations.",
  },
];

const useCases = [
  {
    title: "E-commerce",
    description: "Same-day delivery for online orders",
    examples: ["Last-mile delivery", "Returns processing", "Warehouse pickups"],
  },
  {
    title: "Restaurants",
    description: "Hot food delivery to customers",
    examples: ["Food delivery", "Supply runs", "Multi-branch logistics"],
  },
  {
    title: "Offices",
    description: "Document and package handling",
    examples: ["Inter-office delivery", "Client document runs", "Mail services"],
  },
  {
    title: "Healthcare",
    description: "Sensitive item transport",
    examples: ["Lab sample delivery", "Pharmacy supplies", "Equipment transport"],
  },
];

const Partners = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
                For Businesses
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6 leading-tight">
                Scale Your Business with Pro Errands
              </h1>
              <p className="text-secondary-foreground/80 text-lg mb-8">
                From startups to enterprises, we provide tailored logistics solutions that save time, reduce costs, and delight your customers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" asChild>
                  <a href="#contact">Get Started</a>
                </Button>
                <Button
                  variant="hero-outline"
                  size="lg"
                  className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
                  asChild
                >
                  <Link to="/services/corporate">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { value: "200+", label: "Business Partners" },
                { value: "50K+", label: "Monthly Deliveries" },
                { value: "99.5%", label: "On-Time Rate" },
                { value: "4.9/5", label: "Satisfaction Score" },
              ].map((stat) => (
                <div key={stat.label} className="bg-secondary-foreground/10 rounded-xl p-6 text-center">
                  <div className="font-display text-3xl font-bold text-primary mb-1">{stat.value}</div>
                  <div className="text-sm text-secondary-foreground/70">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Enterprise-Grade Features
            </h2>
            <p className="text-muted-foreground text-lg">
              Everything you need to streamline your logistics operations.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all"
              >
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Solutions for Every Industry
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((useCase) => (
              <div key={useCase.title} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-display text-lg font-bold text-foreground mb-2">{useCase.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{useCase.description}</p>
                <ul className="space-y-2">
                  {useCase.examples.map((example) => (
                    <li key={example} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* API Section */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
                Developer-Friendly
              </span>
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-6">
                Powerful API Integration
              </h2>
              <p className="text-muted-foreground text-lg mb-6">
                Integrate Pro Errands directly into your systems. Create orders, track deliveries, and receive webhooks programmatically.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "RESTful API with comprehensive documentation",
                  "Webhooks for real-time order updates",
                  "SDKs for popular programming languages",
                  "Sandbox environment for testing",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              <Button variant="outline" asChild>
                <a href="#">
                  View API Docs
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
            <div className="bg-secondary rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <pre className="text-secondary-foreground/90">
{`POST /api/v1/orders
Content-Type: application/json
Authorization: Bearer YOUR_API_KEY

{
  "service": "delivery",
  "pickup": {
    "address": "Westlands, Nairobi",
    "contact": "+254712345678"
  },
  "dropoff": {
    "address": "Kilimani, Nairobi",
    "contact": "+254798765432"
  },
  "package": {
    "type": "document",
    "size": "small"
  },
  "priority": "express"
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section id="contact" className="section-padding bg-muted">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Let's Partner Up
              </h2>
              <p className="text-muted-foreground text-lg">
                Fill out the form and our team will get back to you within 24 hours.
              </p>
            </div>
            <form className="bg-card rounded-2xl p-8 border border-border space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
                  <Input placeholder="Your company" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Industry</label>
                  <Input placeholder="e.g., E-commerce, Healthcare" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Contact Name</label>
                  <Input placeholder="Your name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                  <Input type="email" placeholder="you@company.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Phone Number</label>
                <Input placeholder="+254 7XX XXX XXX" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Monthly Delivery Volume</label>
                <Input placeholder="e.g., 100-500 deliveries" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tell us about your needs</label>
                <Textarea placeholder="Describe your logistics requirements..." rows={4} />
              </div>
              <Button variant="hero" size="lg" className="w-full">
                Submit Inquiry
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Partners;
