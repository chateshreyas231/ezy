import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function CareersPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="Careers at Ezriya"
      subtitle="Join a product-driven team building real estate workflow software."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Why Work With Us",
          body: [
            "We build software used by real people in day-to-day real estate workflows.",
            "We value clear thinking, strong execution, and collaboration across engineering, design, and operations.",
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
