import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function ContactPage() {
  return (
    <InfoPageLayout
      eyebrow="Company"
      title="Contact Ezriya"
      subtitle="Get in touch for sales, support, partnerships, media, and compliance requests."
      updatedAt="February 12, 2026"
      sections={[
        {
          title: "Primary Contacts",
          body: [
            "General: connect@ezriya.com",
            "Sales: connect@ezriya.com",
            "Support: connect@ezriya.com",
          ],
        },
        {
          title: "Specialized Requests",
          body: [
            "Partnerships: connect@ezriya.com",
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
