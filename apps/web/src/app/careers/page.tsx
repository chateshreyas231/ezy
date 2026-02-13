import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function CareersPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="Careers at Ezriya"
      subtitle="Join a product-driven team building the operating system for modern real estate collaboration."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Why Work With Us",
          body: [
            "We are building mission-critical software for one of the world’s largest industries. Your work has immediate impact on real users and real transactions.",
            "We value speed, product quality, ownership, and transparent communication across engineering, design, and go-to-market teams.",
          ],
        },
        {
          title: "Open Roles",
          body: [
            "Current hiring focus: Full-Stack Engineers, Product Designers, Applied AI Engineers, and Customer Success Operations.",
            "For role details and application instructions, send your portfolio or resume to careers@ezriya.com.",
          ],
        },
        {
          title: "Hiring Principles",
          body: [
            "We hire for clear thinking, execution quality, and strong collaboration habits. Domain experience in real estate is valuable but not required.",
            "We are committed to equal opportunity and inclusive hiring across backgrounds and experiences.",
          ],
        },
      ]}
    />
  );
}
