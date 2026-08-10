import { Layout } from "@/components/layout";
import {
  HeroSection,
  HowItWorksSection,
  ServicesSection,
  TestimonialsSection,
  TrackOrderSection,
  CTASection,
  BusinessSection,
} from "@/components/home";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <HowItWorksSection />
      <ServicesSection />
      <TestimonialsSection />
      <TrackOrderSection />
      <BusinessSection />
      <CTASection />
    </Layout>
  );
};

export default Index;
