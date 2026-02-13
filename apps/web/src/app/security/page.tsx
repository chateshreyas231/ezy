import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function SecurityPage() {
  return (
    <InfoPageLayout
      eyebrow="Trust"
      title="Security"
      subtitle="Security controls and operational practices used by Ezriya."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Application Security",
          body: [
            "Ezriya applies role-based access controls, authentication boundaries, and least-privilege design across product workflows.",
            "We continuously review app behavior for vulnerabilities and deployment risks.",
          ],
        },
        {
          title: "Infrastructure and Data Protection",
          body: [
            "Platform data is protected in transit and at rest using modern cloud security standards and managed infrastructure controls.",
            "Access to production systems is restricted and audited.",
          ],
        },
        {
          title: "Incident Response",
          body: [
            "We maintain internal incident response procedures for detection, containment, communication, and remediation.",
            "Security reports can be sent to connect@ezriya.com.",
          ],
        },
      ]}
    />
  );
}
