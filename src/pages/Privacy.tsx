import { Layout } from "@/components/layout";

const Privacy = () => (
  <Layout>
    <section className="section-padding bg-background">
      <div className="container-custom max-w-3xl">
        <h1 className="font-display text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-gray max-w-none">
          <p className="text-muted-foreground mb-6">Last updated: December 2024</p>
          {[
            { title: "1. Information We Collect", content: "We collect personal information including name, phone number, email, addresses, and payment details to provide our services." },
            { title: "2. How We Use Your Information", content: "Your data is used to process orders, communicate updates, improve services, and ensure security. We do not sell your personal information." },
            { title: "3. Data Security", content: "We implement industry-standard security measures including encryption and secure servers to protect your data." },
            { title: "4. Third Parties", content: "We may share data with payment processors, riders, and service providers necessary to fulfill orders. All partners are bound by confidentiality agreements." },
            { title: "5. Your Rights", content: "You can request access to, correction of, or deletion of your personal data by contacting privacy@proerrands.co.ke." },
            { title: "6. Cookies", content: "Our website uses cookies to enhance your experience. You can manage cookie preferences in your browser settings." },
            { title: "7. Contact", content: "For privacy inquiries, email privacy@proerrands.co.ke or call +254 711 301 315." },
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

export default Privacy;
