import { Layout } from "@/components/layout";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Book, CreditCard, Package, Shield, HelpCircle, MessageSquare, Phone, Mail, ChevronRight } from "lucide-react";

const categories = [
  {
    icon: Package,
    title: "Orders & Delivery",
    description: "Placing orders, tracking, and delivery issues",
    href: "/help/orders",
    articles: 12,
  },
  {
    icon: CreditCard,
    title: "Payments & Refunds",
    description: "Payment methods, billing, and refund policies",
    href: "/help/payments",
    articles: 8,
  },
  {
    icon: Shield,
    title: "Safety & Packaging",
    description: "How we keep your items safe",
    href: "/help/safety",
    articles: 6,
  },
  {
    icon: Book,
    title: "Getting Started",
    description: "New to Pro Errands? Start here",
    href: "/help/getting-started",
    articles: 5,
  },
  {
    icon: HelpCircle,
    title: "Account & Settings",
    description: "Managing your profile and preferences",
    href: "/help/account",
    articles: 7,
  },
  {
    icon: MessageSquare,
    title: "Contact & Support",
    description: "Get in touch with our team",
    href: "/contact",
    articles: 3,
  },
];

const popularArticles = [
  { title: "How do I track my order?", href: "/help/track" },
  { title: "What payment methods do you accept?", href: "/help/payments" },
  { title: "How long does delivery take?", href: "/help/delivery-times" },
  { title: "Can I cancel or modify my order?", href: "/help/cancel-order" },
  { title: "What areas do you cover?", href: "/help/coverage" },
  { title: "How do refunds work?", href: "/help/refunds" },
];

const faqs = [
  {
    question: "How do I place an order?",
    answer: "You can place an order through our website or mobile app. Simply select the service you need, enter pickup and delivery details, choose your payment method, and confirm. It's that easy!",
  },
  {
    question: "What are your operating hours?",
    answer: "We operate 7 days a week, from 7:00 AM to 10:00 PM. Orders placed outside these hours will be processed first thing the next morning.",
  },
  {
    question: "How can I track my order?",
    answer: "Once your order is confirmed, you'll receive a tracking link via SMS and email. You can also track from the 'Track Order' page by entering your order ID.",
  },
  {
    question: "What if my package is damaged or lost?",
    answer: "All packages are insured. If there's any issue with your delivery, contact our support team immediately. We'll investigate and process a refund or replacement.",
  },
  {
    question: "Can I schedule orders in advance?",
    answer: "Yes! When placing an order, you can choose 'Schedule for later' and select your preferred date and time for pickup.",
  },
  {
    question: "Do you offer business accounts?",
    answer: "Yes, we offer corporate solutions with volume discounts, monthly invoicing, API access, and dedicated account management. Visit our Partners page to learn more.",
  },
];

const Help = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-secondary text-secondary-foreground section-padding">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6">
              How Can We Help?
            </h1>
            <p className="text-secondary-foreground/80 text-lg mb-8">
              Search our help center or browse categories below.
            </p>
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search for help..."
                className="pl-12 h-14 bg-background text-foreground text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            Browse by Category
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link
                key={category.title}
                to={category.href}
                className="bg-card rounded-xl p-6 border border-border hover:border-primary/30 hover:shadow-lg transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                    <category.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {category.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-2">{category.description}</p>
                    <span className="text-xs text-muted-foreground">{category.articles} articles</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="section-padding bg-muted">
        <div className="container-custom">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            Popular Articles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {popularArticles.map((article) => (
              <Link
                key={article.title}
                to={article.href}
                className="flex items-center gap-3 bg-card rounded-lg p-4 border border-border hover:border-primary/30 hover:bg-card/80 transition-all group"
              >
                <Book className="h-5 w-5 text-primary shrink-0" />
                <span className="text-foreground group-hover:text-primary transition-colors">
                  {article.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="section-padding bg-background">
        <div className="container-custom">
          <h2 className="font-display text-2xl font-bold text-foreground mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-muted rounded-xl p-6">
                <h3 className="font-semibold text-foreground mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-custom">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-2xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-secondary-foreground/80 mb-8">
              Our support team is available 7 days a week to assist you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" asChild>
                <a href="tel:+254711301315">
                  <Phone className="mr-2 h-4 w-4" />
                  Call: +254 711 301 315
                </a>
              </Button>
              <Button
                variant="hero-outline"
                className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
                asChild
              >
                <a href="https://wa.me/254711301315" target="_blank" rel="noopener noreferrer">
                  <MessageSquare className="mr-2 h-4 w-4" />
                  WhatsApp Us
                </a>
              </Button>
              <Button
                variant="hero-outline"
                className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10"
                asChild
              >
                <a href="mailto:support@proerrands.co.ke">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Help;
