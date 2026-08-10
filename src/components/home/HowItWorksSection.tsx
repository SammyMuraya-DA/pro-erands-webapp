import { Smartphone, MapPin, CheckCircle2 } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Smartphone,
    title: "Place Your Order",
    description: "Tell us what you need - pickup, delivery, shopping, or any errand. Use our app or website.",
  },
  {
    number: "02",
    icon: MapPin,
    title: "We Pick Up & Handle",
    description: "Our verified riders pick up your items or run your errand. Track progress in real-time.",
  },
  {
    number: "03",
    icon: CheckCircle2,
    title: "Delivered to You",
    description: "Receive your items safely at your doorstep. Pay via M-Pesa, card, or wallet.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Three Simple Steps
          </h2>
          <p className="text-muted-foreground text-lg">
            Getting your errands done has never been easier. We've simplified the process so you can focus on what matters.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div
              key={step.number}
              className="relative group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
              )}

              <div className="relative bg-card rounded-2xl p-8 border border-border hover:border-primary/30 hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                {/* Number Badge */}
                <div className="absolute -top-4 left-8">
                  <span className="inline-flex items-center justify-center h-8 px-3 bg-gradient-to-r from-primary to-accent text-primary-foreground text-sm font-bold rounded-full">
                    {step.number}
                  </span>
                </div>

                {/* Icon */}
                <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
