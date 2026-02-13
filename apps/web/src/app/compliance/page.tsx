import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function CompliancePage() {
  return (
    <InfoPageLayout
      eyebrow="Trust"
      title="Compliance"
      subtitle="Operational alignment and governance principles used by Ezriya."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Governance",
          body: [
            "Ezriya maintains policy-driven controls for platform operations, access management, and data handling practices.",
            "We document responsibilities across engineering, support, and operational stakeholders.",
          ],
        },
        {
          title: "Industry and Regulatory Alignment",
          body: [
            "We design our workflows to support brokerage and transaction operations with clear auditability and accountability.",
            "Customers are responsible for legal obligations specific to their jurisdiction and transaction activities.",
          ],
        },
        {
          title: "Policy Requests",
          body: [
            "For compliance questionnaires, security documentation, and procurement reviews, contact compliance@ezriya.com.",
            "We can provide appropriate documentation under NDA when required.",
          ],
        },
      ]}
    />
  );
}
