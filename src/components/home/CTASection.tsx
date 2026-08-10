import { Link } from "react-router-dom";
import { ArrowRight, Smartphone, Apple, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground overflow-hidden">
      <div className="container-custom">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              Ready to Simplify Your Life?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg">
              Download the Pro Errands app and start your first order in minutes. Available on iOS and Android.
            </p>

            {/* App Download Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-background text-foreground rounded-xl px-6 py-3 hover:bg-background/90 transition-colors"
              >
                <Apple className="h-8 w-8" />
                <div>
                  <div className="text-xs opacity-70">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="#"
                className="inline-flex items-center gap-3 bg-background text-foreground rounded-xl px-6 py-3 hover:bg-background/90 transition-colors"
              >
                <Play className="h-8 w-8 fill-current" />
                <div>
                  <div className="text-xs opacity-70">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </a>
            </div>

            {/* Web Order */}
            <div className="flex items-center gap-4">
              <span className="text-primary-foreground/70">or</span>
              <Button
                variant="hero-outline"
                size="lg"
                asChild
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link to="/order/start">
                  Order on Web
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Right - Phone Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="relative">
              {/* Phone Frame */}
              <div className="relative z-10 bg-secondary rounded-[3rem] p-3 shadow-2xl">
                <div className="bg-background rounded-[2.5rem] overflow-hidden w-64 h-[500px] relative">
                  {/* Status Bar */}
                  <div className="bg-foreground/5 px-6 py-3 flex items-center justify-between">
                    <span className="text-xs font-medium">9:41</span>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-2 bg-foreground/30 rounded-sm" />
                      <div className="w-4 h-2 bg-foreground/30 rounded-sm" />
                      <div className="w-6 h-3 bg-success rounded-sm" />
                    </div>
                  </div>

                  {/* App Content */}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-sm">P</span>
                      </div>
                      <span className="font-display font-bold text-sm">Pro Errands</span>
                    </div>

                    <div className="bg-muted rounded-xl p-4 mb-4">
                      <div className="text-xs text-muted-foreground mb-1">Active Order</div>
                      <div className="font-semibold text-sm mb-2">Grocery Delivery</div>
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 flex-1 bg-border rounded-full overflow-hidden">
                          <div className="h-full w-2/3 bg-gradient-to-r from-primary to-accent rounded-full" />
                        </div>
                        <span className="text-xs text-success font-medium">66%</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {["Delivery", "Shopping", "Bills", "Concierge"].map((service) => (
                        <div
                          key={service}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                        >
                          <span className="text-sm font-medium">{service}</span>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Nav */}
                  <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-3">
                    <div className="flex items-center justify-around">
                      {["Home", "Track", "Order", "Account"].map((item, i) => (
                        <div
                          key={item}
                          className={`text-center ${i === 2 ? "text-primary" : "text-muted-foreground"}`}
                        >
                          <div className={`h-6 w-6 mx-auto rounded-full ${i === 2 ? "bg-primary" : "bg-muted"}`} />
                          <span className="text-[10px] mt-1 block">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent/30 rounded-full blur-3xl" />
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-primary-foreground/10 rounded-full blur-3xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
