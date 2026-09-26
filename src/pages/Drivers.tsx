import { useState, type FormEvent } from "react";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DollarSign, Clock, Shield, Smartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Drivers = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSubmitting(true);

    const formData = new FormData(form);
    const application = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      email: String(formData.get("email") || "").trim() || null,
      city: String(formData.get("city") || "").trim() || null,
      vehicle_type: String(formData.get("vehicle_type") || "").trim() || "motorcycle",
      vehicle_plate: String(formData.get("vehicle_plate") || "").trim() || null,
    };

    try {
      const { error } = await supabase.from("rider_applications").insert(application);
      if (error) throw error;

      form.reset();
      toast({ title: "Application submitted", description: "Our team will review your application." });
    } catch (error) {
      console.error("Rider application submission failed:", error);
      const message = error && typeof error === "object" && "message" in error && typeof error.message === "string"
        ? error.message
        : "Please try again later or contact our team.";
      toast({
        title: "Could not submit application",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <section className="bg-gradient-to-br from-primary via-primary to-accent text-primary-foreground section-padding">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-display text-4xl sm:text-5xl font-bold mb-6">Become a Pro Errands Rider</h1>
            <p className="text-primary-foreground/80 text-lg mb-8">
              Earn on your own schedule. Join Kenya's fastest-growing errand and delivery network.
            </p>
            <Button variant="hero-outline" size="xl" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <a href="#apply">Apply Now</a>
            </Button>
          </div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-custom">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: DollarSign, title: "Competitive Pay", desc: "Earn KES 800-2000+ daily" },
              { icon: Clock, title: "Flexible Hours", desc: "Work when you want" },
              { icon: Shield, title: "Insurance", desc: "Accident coverage included" },
              { icon: Smartphone, title: "Easy App", desc: "Simple to use rider app" },
            ].map((item) => (
              <div key={item.title} className="bg-card rounded-xl p-6 border border-border text-center">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="section-padding bg-muted">
        <div className="container-custom max-w-xl">
          <h2 className="font-display text-3xl font-bold text-foreground mb-8 text-center">Apply to Ride</h2>
          <form onSubmit={handleSubmit} className="bg-card rounded-2xl p-8 border border-border space-y-6">
            <Input name="name" placeholder="Full Name" aria-label="Full name" required />
            <Input name="phone" placeholder="Phone Number" aria-label="Phone number" type="tel" required />
            <Input name="email" placeholder="Email (optional)" aria-label="Email" type="email" />
            <Input name="city" placeholder="City or area" aria-label="City or area" />
            <Input name="vehicle_type" placeholder="Vehicle Type (Motorcycle, Bicycle, Car)" aria-label="Vehicle type" />
            <Input name="vehicle_plate" placeholder="Vehicle plate (optional)" aria-label="Vehicle plate" />
            <Button variant="hero" size="lg" className="w-full" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </div>
      </section>
    </Layout>
  );
};

export default Drivers;
