import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function AboutPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="About Ezriya"
      subtitle="Ezriya builds AI-powered real estate infrastructure that helps clients, agents, brokers, and vendors work in one connected workflow."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Who We Are",
          body: [
            "Ezriya is a real estate technology startup focused on simplifying complex transaction journeys. We combine modern product design, AI-assisted workflows, and role-based workspaces for every participant in a deal.",
            "Our platform supports client portals, agent operations, brokerage coordination, and vendor marketplace execution from one unified system.",
          ],
        },
        {
          title: "Mission",
          body: [
            "Our mission is to make every real estate transaction more transparent, more predictable, and easier to execute.",
            "We reduce context switching by centralizing communication, timelines, documents, and action plans across teams.",
          ],
        },
        {
          title: "What We Build",
          body: [
            "Ezriya provides client workspaces, AI guidance, market intelligence, listing exploration, vendor discovery, and cross-role collaboration features.",
            "We design workflows that can scale from single-agent operations to multi-office broker organizations.",
          ],
        },
      ]}
    />
  );
}
