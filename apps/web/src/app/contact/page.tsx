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
            "General: hello@ezriya.com",
            "Sales: sales@ezriya.com",
            "Support: support@ezriya.com",
          ],
        },
        {
          title: "Specialized Requests",
          body: [
            "Partnerships: partners@ezriya.com",
            "Press: press@ezriya.com",
            "Security: security@ezriya.com",
            "Compliance: compliance@ezriya.com",
          ],
        },
        {
          title: "Office",
          body: [
            "Ezriya, Inc.",
            "San Francisco, California, United States",
            "Phone: +1 (415) 555-0147",
          ],
        },
      ]}
    />
  );
}
