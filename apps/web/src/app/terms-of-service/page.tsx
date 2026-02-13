import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function TermsOfServicePage() {
  return (
    <InfoPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      subtitle="Rules and responsibilities for using Ezriya services."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Account Responsibilities",
          body: [
            "Users are responsible for maintaining account credentials and ensuring submitted information is accurate and lawful.",
            "You agree not to misuse the platform, disrupt service operations, or attempt unauthorized access.",
          ],
        },
        {
          title: "Service Scope",
          body: [
            "Ezriya provides workflow and collaboration software. We do not directly broker transactions unless explicitly stated in signed agreements.",
            "Feature availability may change as the platform evolves.",
          ],
        },
        {
          title: "Liability and Termination",
          body: [
            "To the extent permitted by law, Ezriya disclaims indirect and consequential damages arising from platform use.",
            "We may suspend or terminate access for policy violations, legal risk, or fraudulent activity.",
          ],
        },
      ]}
    />
  );
}
