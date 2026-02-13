import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function PartnerProgramPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="Partner Program"
      subtitle="Collaborate with Ezriya as a brokerage, technology, service, or channel partner."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Who Can Partner",
          body: [
            "We work with broker organizations, real estate teams, service providers, technology integrators, and strategic distribution partners.",
            "Ideal partners focus on measurable workflow improvement and customer experience outcomes.",
          ],
        },
        {
          title: "Program Benefits",
          body: [
            "Partner access includes implementation support, co-marketing opportunities, integration guidance, and operational enablement.",
            "Enterprise partners can request roadmap alignment and technical planning sessions.",
          ],
        },
        {
          title: "How to Apply",
          body: [
            "Email partners@ezriya.com with your company profile, target use case, and expected deployment footprint.",
            "Our partnerships team reviews submissions and responds with next steps.",
          ],
        },
      ]}
    />
  );
}
