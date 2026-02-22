import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function AboutPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="About Ezriya"
      subtitle="Ezriya is real estate workflow software with AI-assisted coordination tools and role-based workspaces."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Who We Are",
          body: [
            "Ezriya is a software company focused on real estate workflow coordination.",
            "Our platform supports client workspaces, agent operations, broker organization workflows, and vendor coordination in one system.",
          ],
        },
        {
          title: "Product Scope",
          body: [
            "Ezriya provides software and infrastructure for activity tracking, document organization, and collaboration.",
            "Users and licensed professionals make their own decisions and handle transaction-specific services independently.",
          ],
        },
        {
          title: "What We Build",
          body: [
            "We build AI-assisted coordination tools, participant directories, and role-based workspaces.",
            "We do not provide brokerage services, representation, or negotiation services.",
          ],
        },
      ]}
    />
  );
}
