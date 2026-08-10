import { Layout } from "@/components/layout";

const Terms = () => (
  <Layout>
    <section className="section-padding bg-background">
      <div className="container-custom max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Terms & Conditions</h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: December 2024</p>
          {[
            { title: "1. Acceptance of Terms", content: "By using Pro Errands Solutions services, you agree to these terms and conditions. Please read them carefully before using our services." },
            { title: "2. Services", content: "Pro Errands provides on-demand errand and delivery services including but not limited to same-day delivery, grocery shopping, pickup and drop-off, bill payments, and concierge services." },
            { title: "3. User Responsibilities", content: "Users must provide accurate information, ensure items are legal and properly packaged, and be available at pickup/delivery locations." },
            { title: "4. Pricing & Payment", content: "Prices are displayed before order confirmation. We accept M-Pesa, credit/debit cards, and wallet payments. All payments are final unless a refund is warranted." },
            { title: "5. Liability", content: "Pro Errands insures packages up to KES 50,000. We are not liable for delays due to traffic, weather, or circumstances beyond our control." },
            { title: "6. Cancellation", content: "Orders can be cancelled before rider pickup for a full refund. Cancellations after pickup may incur fees." },
            { title: "7. Contact", content: "For questions about these terms, contact us at legal@proerrands.co.ke or +254 711 301 315." },
          ].map((section) => (
            <div key={section.title} className="mb-6">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">{section.title}</h2>
              <p className="text-muted-foreground">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </Layout>
);

export default Terms;
