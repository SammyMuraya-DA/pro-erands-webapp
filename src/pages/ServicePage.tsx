import { Layout } from "@/components/layout";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Clock, Shield, MapPin } from "lucide-react";
import serviceDelivery from "@/assets/service-delivery.png";
import serviceShopping from "@/assets/service-shopping.png";
import servicePickup from "@/assets/service-pickup.png";
import serviceBills from "@/assets/service-bills.png";
import serviceConcierge from "@/assets/service-concierge.png";
import serviceCorporate from "@/assets/service-corporate.png";

const servicesData: Record<string, {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  features: string[];
  steps: { title: string; description: string }[];
  pricing: { name: string; price: string; description: string }[];
  faqs: { question: string; answer: string }[];
}> = {
  delivery: {
    title: "Same-Day Delivery",
    subtitle: "Fast & Reliable Delivery Across Nairobi",
    description: "Need something delivered today? Our same-day delivery service ensures your packages, documents, and items reach their destination quickly and safely.",
    image: serviceDelivery,
    features: [
      "Delivery within 2-4 hours",
      "Real-time GPS tracking",
      "Photo proof of delivery",
      "Insurance coverage included",
      "Multiple package sizes",
      "Scheduled deliveries available",
    ],
    steps: [
      { title: "Request Delivery", description: "Enter pickup and drop-off locations in our app" },
      { title: "Package Pickup", description: "Our rider arrives to collect your package" },
      { title: "Real-Time Tracking", description: "Track your delivery live on the map" },
      { title: "Safe Delivery", description: "Receive confirmation when delivered" },
    ],
    pricing: [
      { name: "Standard", price: "KES 150", description: "Within 4 hours, up to 5kg" },
      { name: "Express", price: "KES 250", description: "Within 2 hours, up to 5kg" },
      { name: "Large Package", price: "KES 350", description: "Standard timing, 5-15kg" },
    ],
    faqs: [
      { question: "How fast can you deliver?", answer: "Express deliveries can be completed within 2 hours. Standard deliveries typically take 2-4 hours depending on distance." },
      { question: "What items can you deliver?", answer: "We deliver documents, packages, food items, electronics, and more. Prohibited items include hazardous materials, illegal goods, and extremely fragile items." },
      { question: "Is my package insured?", answer: "Yes, all packages are insured up to KES 50,000. For higher value items, additional insurance is available." },
    ],
  },
  shopping: {
    title: "Grocery & Pharmacy Shopping",
    subtitle: "We Shop, You Receive",
    description: "No time to shop? Our personal shoppers handle your grocery lists and pharmacy pickups, delivering fresh items right to your door.",
    image: serviceShopping,
    features: [
      "Fresh grocery selection",
      "Pharmacy prescriptions",
      "Quality checks before delivery",
      "Substitution preferences",
      "Multiple store options",
      "Receipt provided",
    ],
    steps: [
      { title: "Share Your List", description: "Send your shopping list via app or WhatsApp" },
      { title: "We Shop", description: "Our shopper picks the freshest items" },
      { title: "Quality Check", description: "Items verified before dispatch" },
      { title: "Delivery", description: "Groceries delivered to your door" },
    ],
    pricing: [
      { name: "Small Shop", price: "KES 200", description: "Up to 10 items" },
      { name: "Medium Shop", price: "KES 350", description: "11-25 items" },
      { name: "Full Cart", price: "KES 500", description: "26+ items" },
    ],
    faqs: [
      { question: "How do I send my shopping list?", answer: "You can type it in the app, upload a photo, or send via WhatsApp. Our shoppers will confirm the list before shopping." },
      { question: "What if an item is unavailable?", answer: "You can set substitution preferences in advance, or our shopper will contact you for alternatives." },
      { question: "Which stores do you shop from?", answer: "We shop from major supermarkets including Naivas, Carrefour, Quickmart, and local pharmacies." },
    ],
  },
  "pickup-drop": {
    title: "Pickup & Drop",
    subtitle: "Collect & Deliver Anything",
    description: "Need to collect a parcel from the post office? Pick up documents from a client? Drop off a package? We handle it all.",
    image: servicePickup,
    features: [
      "Document collection",
      "Parcel pickup from offices",
      "Post office errands",
      "Multiple stops available",
      "ID verification on pickup",
      "Secure handling",
    ],
    steps: [
      { title: "Book Pickup", description: "Tell us where to collect from" },
      { title: "Verification", description: "Rider verifies and collects the item" },
      { title: "Transport", description: "Safe transit to destination" },
      { title: "Delivery", description: "Handover at drop-off location" },
    ],
    pricing: [
      { name: "Single Stop", price: "KES 150", description: "One pickup, one drop-off" },
      { name: "Multi-Stop", price: "KES 250", description: "Up to 3 locations" },
      { name: "Document Run", price: "KES 200", description: "Offices & government buildings" },
    ],
    faqs: [
      { question: "Can you collect from any location?", answer: "Yes, we can collect from offices, homes, post offices, courier depots, and most public locations." },
      { question: "What identification is needed?", answer: "You can set pickup codes or our rider can show ID. For sensitive documents, we offer verification protocols." },
      { question: "Do you handle multiple stops?", answer: "Absolutely! You can add up to 5 stops in a single trip for an additional fee per stop." },
    ],
  },
  "bills-payments": {
    title: "Bills & Payments",
    subtitle: "We Handle Your Payments",
    description: "Skip the queues! We pay your utility bills, make bank deposits, collect documents from government offices, and more.",
    image: serviceBills,
    features: [
      "Utility bill payments",
      "Bank deposits & withdrawals",
      "Government office errands",
      "Insurance premium payments",
      "School fee payments",
      "Receipt collection",
    ],
    steps: [
      { title: "Provide Details", description: "Share bill details and payment amount" },
      { title: "Fund Transfer", description: "Transfer funds securely via M-Pesa" },
      { title: "Payment Made", description: "We make the payment on your behalf" },
      { title: "Confirmation", description: "Receive receipt and confirmation" },
    ],
    pricing: [
      { name: "Utility Bills", price: "KES 100", description: "KPLC, Water, Internet, etc." },
      { name: "Bank Errands", price: "KES 200", description: "Deposits, withdrawals, statements" },
      { name: "Government", price: "KES 300", description: "KRA, NTSA, Immigration, etc." },
    ],
    faqs: [
      { question: "How do I send the money for payment?", answer: "You can M-Pesa the amount plus service fee to our business number. We confirm receipt before proceeding." },
      { question: "Do you handle bank withdrawals?", answer: "For security, we handle deposits and document collection. Withdrawals require special arrangements." },
      { question: "Can you pay my taxes?", answer: "Yes, we can make KRA payments, NHIF, NSSF contributions with your reference numbers." },
    ],
  },
  concierge: {
    title: "Errand Concierge",
    subtitle: "Your Personal Assistant",
    description: "Got a unique task? Our concierge service handles any errand you can think of. From waiting in queues to special requests - just ask!",
    image: serviceConcierge,
    features: [
      "Custom errands of any kind",
      "Queue waiting service",
      "Event ticket collection",
      "Gift shopping & delivery",
      "Key handover & access",
      "Personal assistant tasks",
    ],
    steps: [
      { title: "Describe Your Need", description: "Tell us exactly what you need done" },
      { title: "Get a Quote", description: "We'll provide a fair price estimate" },
      { title: "We Execute", description: "Our concierge handles everything" },
      { title: "Task Complete", description: "Updates and confirmation provided" },
    ],
    pricing: [
      { name: "Basic Errand", price: "From KES 200", description: "Simple tasks under 1 hour" },
      { name: "Extended Task", price: "From KES 400", description: "Tasks requiring 1-3 hours" },
      { name: "Custom Quote", price: "Variable", description: "Complex or specialized tasks" },
    ],
    faqs: [
      { question: "What kind of tasks can you do?", answer: "Almost anything legal! Queue waiting, research, event planning help, personal shopping, vehicle services, pet care arrangements, and more." },
      { question: "How is pricing calculated?", answer: "Based on time required, complexity, any purchases needed, and travel distance. We always provide quotes upfront." },
      { question: "Can you handle recurring tasks?", answer: "Yes! We offer weekly and monthly concierge subscriptions for regular errands." },
    ],
  },
  corporate: {
    title: "Corporate Solutions",
    subtitle: "Business Logistics Made Easy",
    description: "Tailored logistics and errand solutions for businesses of all sizes. Fleet management, API integration, dedicated support, and volume pricing.",
    image: serviceCorporate,
    features: [
      "Dedicated account manager",
      "API & system integration",
      "Custom SLA agreements",
      "Volume-based pricing",
      "Priority rider dispatch",
      "Detailed reporting & analytics",
    ],
    steps: [
      { title: "Consultation", description: "We understand your business needs" },
      { title: "Custom Plan", description: "Tailored solution designed for you" },
      { title: "Integration", description: "Seamless setup with your systems" },
      { title: "Ongoing Support", description: "Dedicated team at your service" },
    ],
    pricing: [
      { name: "Starter", price: "From KES 15,000/mo", description: "Up to 50 errands/month" },
      { name: "Business", price: "From KES 35,000/mo", description: "Up to 150 errands/month" },
      { name: "Enterprise", price: "Custom", description: "Unlimited, full integration" },
    ],
    faqs: [
      { question: "Do you offer API integration?", answer: "Yes, our REST API allows you to create orders, track deliveries, and receive webhooks directly in your systems." },
      { question: "What's the minimum commitment?", answer: "Our Starter plan has no long-term commitment. Business and Enterprise plans typically start with 3-month agreements." },
      { question: "Can you handle our entire logistics?", answer: "Absolutely! Many businesses outsource their entire delivery and errand operations to us." },
    ],
  },
};

const ServicePage = () => {
  const { service } = useParams<{ service: string }>();
  const data = servicesData[service || "delivery"];

  if (!data) {
    return (
      <Layout>
        <div className="section-padding text-center">
          <h1 className="font-display text-3xl font-bold mb-4">Service Not Found</h1>
          <Button asChild>
            <Link to="/">Go Home</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="bg-muted section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
                Our Services
              </span>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground mb-4">
                {data.title}
              </h1>
              <p className="text-xl text-muted-foreground mb-6">{data.subtitle}</p>
              <p className="text-muted-foreground mb-8">{data.description}</p>
              <Button variant="hero" size="lg" asChild>
                <Link to="/order/start">
                  Start Order
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <div className="flex justify-center">
              <img src={data.image} alt={data.title} className="max-w-sm w-full h-auto" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">
            What's Included
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {data.features.map((feature) => (
              <div key={feature} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
                <span className="text-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.steps.map((step, index) => (
              <div key={step.title} className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground font-bold flex items-center justify-center mx-auto mb-4">
                  {index + 1}
                </div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
            Pricing
          </h2>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {data.pricing.map((tier) => (
              <div key={tier.name} className="bg-card rounded-xl p-6 border border-border text-center hover:border-primary/30 hover:shadow-lg transition-all">
                <h3 className="font-semibold text-foreground mb-2">{tier.name}</h3>
                <div className="font-display text-2xl font-bold gradient-text mb-2">{tier.price}</div>
                <p className="text-sm text-muted-foreground">{tier.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <h2 className="font-display text-3xl font-bold text-foreground mb-12 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {data.faqs.map((faq) => (
              <div key={faq.question} className="bg-card rounded-xl p-6 border border-border">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
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
            Place your first order today and experience the Pro Errands difference.
          </p>
          <Button variant="hero" size="lg" asChild>
            <Link to="/order/start">Start Your Order</Link>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default ServicePage;
