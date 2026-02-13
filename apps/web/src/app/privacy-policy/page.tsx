import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="How Ezriya collects, uses, and protects personal data."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Information We Collect",
          body: [
            "We collect account and contact information, platform usage data, and transaction workflow metadata required to deliver the service.",
            "We may also process user-submitted documents and communications based on your workspace activity and permissions.",
          ],
        },
        {
          title: "How We Use Information",
          body: [
            "Data is used to operate the product, improve platform performance, provide support, and maintain account security.",
            "We do not sell personal information. We only share data with approved service providers needed to run core platform functions.",
          ],
        },
        {
          title: "Data Rights",
          body: [
            "You may request access, correction, or deletion of your personal data by contacting privacy@ezriya.com.",
            "We retain data for legal, contractual, and operational reasons based on jurisdictional requirements.",
          ],
        },
      ]}
    />
  );
}
