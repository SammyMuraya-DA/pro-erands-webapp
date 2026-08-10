 import { useState } from "react";
 import { Layout } from "@/components/layout";
 import { Link } from "react-router-dom";
 import { Button } from "@/components/ui/button";
 import { CheckCircle2, X, Star, Smartphone } from "lucide-react";
 import { MpesaPaymentDialog } from "@/components/pricing/MpesaPaymentDialog";

const plans = [
  {
    name: "Pay As You Go",
    description: "Perfect for occasional errands",
    price: "No subscription",
    priceNote: "Pay per errand",
    features: [
      { text: "All services available", included: true },
      { text: "Real-time tracking", included: true },
      { text: "SMS & email updates", included: true },
      { text: "Standard support", included: true },
      { text: "Priority dispatch", included: false },
      { text: "Volume discounts", included: false },
      { text: "Dedicated manager", included: false },
    ],
    cta: "Start Order",
    href: "/order/start",
    popular: false,
  },
  {
    name: "Pro Monthly",
    description: "For regular errand runners",
    price: "KES 999",
    priceNote: "/month",
    features: [
      { text: "All services available", included: true },
      { text: "Real-time tracking", included: true },
      { text: "WhatsApp updates", included: true },
      { text: "Priority support", included: true },
      { text: "Priority dispatch", included: true },
      { text: "10% off all errands", included: true },
      { text: "Dedicated manager", included: false },
    ],
    cta: "Subscribe Now",
    href: "/order/start",
    popular: true,
  },
  {
    name: "Business",
    description: "For companies & teams",
    price: "Custom",
    priceNote: "Contact us",
    features: [
      { text: "All services available", included: true },
      { text: "Real-time tracking", included: true },
      { text: "API integration", included: true },
      { text: "24/7 dedicated support", included: true },
      { text: "Priority dispatch", included: true },
      { text: "Volume discounts up to 30%", included: true },
      { text: "Dedicated account manager", included: true },
    ],
    cta: "Contact Sales",
    href: "/partners",
    popular: false,
  },
];

const servicePricing = [
  {
    service: "Same-Day Delivery",
    prices: [
      { name: "Standard (2-4 hrs)", price: "From KES 150" },
      { name: "Express (1-2 hrs)", price: "From KES 250" },
      { name: "Large Package", price: "From KES 350" },
    ],
  },
  {
    service: "Grocery & Pharmacy",
    prices: [
      { name: "Small Shop (≤10 items)", price: "KES 200" },
      { name: "Medium Shop (11-25)", price: "KES 350" },
      { name: "Full Cart (26+)", price: "KES 500" },
    ],
  },
  {
    service: "Pickup & Drop",
    prices: [
      { name: "Single Stop", price: "From KES 150" },
      { name: "Multi-Stop (up to 3)", price: "From KES 250" },
      { name: "Document Run", price: "From KES 200" },
    ],
  },
  {
    service: "Bills & Payments",
    prices: [
      { name: "Utility Bills", price: "KES 100" },
      { name: "Bank Errands", price: "KES 200" },
      { name: "Government Offices", price: "KES 300" },
    ],
  },
];

const Pricing = () => {
   const [mpesaDialogOpen, setMpesaDialogOpen] = useState(false);
   const [selectedPlan, setSelectedPlan] = useState<{ name: string; price: string } | null>(null);
 
   const handleMpesaPayment = (plan: { name: string; price: string }) => {
     setSelectedPlan(plan);
     setMpesaDialogOpen(true);
   };
 
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-muted section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Pricing
            </span>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-muted-foreground text-lg">
              No hidden fees. Pay only for what you use, or save with our subscription plans.
            </p>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative bg-card rounded-2xl p-8 border ${
                  plan.popular ? "border-primary shadow-lg scale-105" : "border-border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold px-4 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-current" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-display text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="font-display text-4xl font-bold gradient-text">
                    {plan.price}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.priceNote}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature.text} className="flex items-center gap-3">
                      {feature.included ? (
                        <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                      ) : (
                        <X className="h-5 w-5 text-muted-foreground shrink-0" />
                      )}
                      <span className={feature.included ? "text-foreground" : "text-muted-foreground"}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full"
                  asChild
                >
                  <Link to={plan.href}>{plan.cta}</Link>
                </Button>
                 
                 {plan.name === "Pro Monthly" && (
                   <Button
                     variant="outline"
                     className="w-full mt-3 border-[#00A650] text-[#00A650] hover:bg-[#00A650] hover:text-white"
                     onClick={() => handleMpesaPayment({ name: plan.name, price: plan.price })}
                   >
                     <Smartphone className="mr-2 h-4 w-4" />
                     Pay with M-Pesa
                   </Button>
                 )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Pricing */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
            Service Pricing Guide
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {servicePricing.map((service) => (
              <div key={service.service} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-display font-semibold text-foreground mb-4">{service.service}</h3>
                <ul className="space-y-3">
                  {service.prices.map((price) => (
                    <li key={price.name} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{price.name}</span>
                      <span className="font-semibold text-foreground">{price.price}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="text-center text-muted-foreground mt-8">
            * Prices may vary based on distance, weight, and complexity. Get an exact quote when you order.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
            Pricing FAQs
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: "How are delivery prices calculated?",
                a: "Prices are based on distance, package size, and service speed. You always see the final price before confirming your order.",
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept M-Pesa (Lipa Na Mpesa), Visa/Mastercard, and Pro Errands Wallet. Business accounts can pay via invoice.",
              },
              {
                q: "Can I get a refund?",
                a: "Yes, if we fail to complete your errand or there's an issue with the service, you're eligible for a full refund.",
              },
              {
                q: "Are there any hidden fees?",
                a: "No hidden fees! The price you see is the price you pay. Any additional costs (like items purchased) are shown upfront.",
              },
            ].map((faq) => (
              <div key={faq.q} className="bg-muted rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                <p className="text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom text-center">
          <h2 className="font-display text-3xl font-bold mb-4">Ready to Save Time?</h2>
          <p className="text-secondary-foreground/70 mb-8 max-w-lg mx-auto">
            Start with Pay As You Go or subscribe for extra savings.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/order/start">Start Your Order</Link>
          </Button>
        </div>
      </section>
       
       <MpesaPaymentDialog
         open={mpesaDialogOpen}
         onOpenChange={setMpesaDialogOpen}
         plan={selectedPlan}
       />
    </Layout>
  );
};

export default Pricing;
