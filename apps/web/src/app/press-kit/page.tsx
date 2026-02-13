import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function PressKitPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="Press Kit"
      subtitle="Media assets and editorial information for Ezriya."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Brand Summary",
          body: [
            "Ezriya is an AI-powered real estate platform connecting clients, agents, brokers, and vendors in one operating environment.",
            "Preferred short description: “Ezriya is a workflow platform for modern real estate transactions.”",
          ],
        },
        {
          title: "Media Contact",
          body: [
            "For press inquiries, interviews, and speaking requests, contact connect@ezriya.com.",
            "Please include publication name, timeline, and request type so we can route quickly.",
          ],
        },
        {
          title: "Asset Usage",
          body: [
            "Logos, product screenshots, and brand assets are available upon request. Do not alter logo proportions, wordmark spacing, or brand colors without written approval.",
            "Attribution format: “Source: Ezriya, Inc.”",
          ],
        },
      ]}
    />
  );
}
