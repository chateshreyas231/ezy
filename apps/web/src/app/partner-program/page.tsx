import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function PartnerProgramPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="Partner Program"
      subtitle="Collaborate with Ezriya through implementation support, integration guidance, and operational enablement."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Who Can Partner",
          body: [
            "We work with broker organizations, real estate teams, service providers, and technology integrators.",
            "Partner work is focused on software adoption, workflow setup, and operational rollout.",
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
            "Email connect@ezriya.com with your company profile, target use case, and expected deployment footprint.",
            "Our partnerships team reviews submissions and responds with next steps.",
          ],
        },
      ]}
    />
  );
}
