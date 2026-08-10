import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import serviceDelivery from "@/assets/service-delivery.png";
import serviceShopping from "@/assets/service-shopping.png";
import servicePickup from "@/assets/service-pickup.png";
import serviceBills from "@/assets/service-bills.png";
import serviceConcierge from "@/assets/service-concierge.png";
import serviceCorporate from "@/assets/service-corporate.png";

const services = [
  {
    title: "Same-Day Delivery",
    description: "Fast and reliable delivery across the city. From documents to packages, we deliver on time.",
    image: serviceDelivery,
    href: "/services/delivery",
    color: "from-primary/10 to-accent/10",
  },
  {
    title: "Grocery & Pharmacy",
    description: "We shop for your groceries and pick up prescriptions. Fresh items delivered to your door.",
    image: serviceShopping,
    href: "/services/shopping",
    color: "from-success/10 to-primary/10",
  },
  {
    title: "Pickup & Drop",
    description: "Collect parcels, documents, or items from anywhere and have them delivered wherever you need.",
    image: servicePickup,
    href: "/services/pickup-drop",
    color: "from-accent/10 to-primary/10",
  },
  {
    title: "Bills & Payments",
    description: "Let us handle your utility bills, government payments, and bank errands. Save time, stay stress-free.",
    image: serviceBills,
    href: "/services/bills-payments",
    color: "from-primary/10 to-success/10",
  },
  {
    title: "Errand Concierge",
    description: "Got a unique task? Our concierge service handles any errand you can think of. Just ask!",
    image: serviceConcierge,
    href: "/services/concierge",
    color: "from-accent/10 to-success/10",
  },
  {
    title: "Corporate Solutions",
    description: "Tailored logistics and errand solutions for businesses. Fleet management, API access, and more.",
    image: serviceCorporate,
    href: "/services/corporate",
    color: "from-secondary/20 to-primary/10",
  },
];

export function ServicesSection() {
  return (
    <section className="section-padding bg-muted">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            Our Services
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Everything You Need, Handled
          </h2>
          <p className="text-muted-foreground text-lg">
            From quick deliveries to complex errands, we've got you covered with a range of services designed for your busy life.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {services.map((service, index) => (
            <Link
              key={service.href}
              to={service.href}
              className="group relative bg-card rounded-2xl overflow-hidden border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-50 group-hover:opacity-100 transition-opacity`} />

              <div className="relative p-6">
                {/* Image */}
                <div className="h-40 flex items-center justify-center mb-6">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="h-full w-auto object-contain group-hover:scale-110 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {service.description}
                </p>

                {/* Link */}
                <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                  Learn more
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
