import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function ContactPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="Contact Ezriya"
      subtitle="Contact our team through one shared inbox for product, support, or operations questions."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Inbox Routing",
          body: [
            "General: connect@ezriya.com",
            "Support: connect@ezriya.com",
            "Partnerships: connect@ezriya.com",
          ],
        },
        {
          title: "Additional Requests",
          body: [
            "Press: connect@ezriya.com",
            "Security: connect@ezriya.com",
            "Compliance: connect@ezriya.com",
          ],
        },
        {
          title: "Office",
          body: [
            "Ezriya, Inc.",
            "San Francisco, California, United States",

          ],
        },
      ]}
    />
  );
}
