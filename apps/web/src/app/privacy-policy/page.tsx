import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function PrivacyPolicyPage() {
  return (
    <InfoPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      subtitle="Effective Date: February 22, 2026"
      updatedAt="February 22, 2026"
      contactEmail="support@ezriya.com"
      sections={[
        {
          title: "Policy Scope",
          body: [
            'This Privacy Policy describes how Ezriya, Inc. ("Ezriya," "we," "us," or "our") collects, uses, discloses, and safeguards information when you access or use the Ezriya platform, including our website, applications, and related services (collectively, the "Platform").',
            "By using the Platform, you consent to the practices described in this Privacy Policy.",
          ],
        },
        {
          title: "1. Information We Collect",
          body: [
            "1.1 Information You Provide: We collect information you voluntarily provide, including name and email address, account credentials, role and intent declarations, messages and communications with other users, and information you choose to include in your profile.",
            "1.2 Information Collected Automatically: When you use the Platform, we may collect IP address and approximate location, device, browser, and operating system information, log data, timestamps, usage activity, and diagnostic and security data.",
            "1.3 Payment Information: Payments are processed by third-party payment processors. Ezriya does not store full credit card numbers or bank account details.",
            "1.4 Information We Do Not Collect: Ezriya does not collect government-issued identification, biometric or facial recognition data, Social Security numbers, credit reports or background checks, or criminal history.",
          ],
        },
        {
          title: "2. How We Use Information",
          body: [
            "We use information to operate, maintain, and secure the Platform.",
            "We use information to enable user-initiated connections and communications.",
            "We use information to provide customer support.",
            "We use information to improve platform functionality and performance.",
            "We use information to detect fraud, abuse, or misuse.",
            "We use information to comply with legal obligations.",
            "Ezriya does not use personal information for targeted advertising or interest-based advertising.",
          ],
        },
        {
          title: "3. AI and Automated Systems",
          body: [
            "Ezriya may use automated systems, including AI-assisted tools, to organize user-submitted information, surface potential connections based on declared inputs, and improve platform operations.",
            "These systems do not make legal, financial, or transactional decisions, do not approve or deny participation, and do not replace human judgment.",
            "Outputs are informational only.",
          ],
        },
        {
          title: "4. How We Share Information",
          body: [
            "We may share information with other users only when you choose to communicate or connect.",
            "We may share information with service providers supporting hosting, security, analytics, or payments.",
            "We may share information when required by law, subpoena, or legal process.",
            "We may share information to protect the rights, safety, and integrity of Ezriya and users.",
            "Ezriya does not sell personal information and does not share personal information for cross-context behavioral advertising.",
          ],
        },
        {
          title: "5. Data Retention",
          body: [
            "We retain personal information only for as long as reasonably necessary to provide the Platform.",
            "We retain personal information only for as long as reasonably necessary to maintain security and integrity.",
            "We retain personal information only for as long as reasonably necessary to comply with legal obligations.",
            "We retain personal information only for as long as reasonably necessary to resolve disputes and enforce agreements.",
          ],
        },
        {
          title: "6. Data Security",
          body: [
            "We use reasonable administrative, technical, and organizational safeguards to protect personal information.",
            "No system is completely secure, and we cannot guarantee absolute security.",
          ],
        },
        {
          title: "7. Your Choices and Rights",
          body: [
            "You may update or correct account information.",
            "You may delete your account.",
            "You may request access to or deletion of personal data.",
            "Requests may be submitted to: support@ezriya.com.",
          ],
        },
        {
          title: "8. Children's Privacy",
          body: [
            "Ezriya is not intended for individuals under 18 years of age.",
            "We do not knowingly collect personal information from children.",
          ],
        },
        {
          title: "9. Third-Party Links",
          body: [
            "The Platform may contain links to third-party websites.",
            "Ezriya is not responsible for third-party privacy practices.",
          ],
        },
        {
          title: "10. Changes to This Policy",
          body: [
            "We may update this Privacy Policy from time to time.",
            "Continued use of the Platform constitutes acceptance of the updated Policy.",
          ],
        },
        {
          title: "11. Contact",
          body: [
            "Privacy questions or requests: support@ezriya.com.",
          ],
        },
        {
          title: "State-Specific Privacy Rights",
          body: [
            "The following disclosures apply to residents of certain U.S. states in accordance with applicable privacy laws.",
            "Rights may vary by jurisdiction.",
          ],
        },
        {
          title: "California Residents",
          body: [
            "Under the California Consumer Privacy Act (CCPA), as amended by the California Privacy Rights Act (CPRA), California residents have the right to know what personal information is collected, used, shared, or disclosed; access their personal information; delete personal information; correct inaccurate personal information; opt out of the sale or sharing of personal information; and limit the use of sensitive personal information.",
            "Ezriya does not sell or share personal information as defined under California law.",
          ],
        },
        {
          title: "Virginia Residents",
          body: [
            "Under the Virginia Consumer Data Protection Act (VCDPA), Virginia residents have the right to access personal data, correct inaccuracies in personal data, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling that produces legal or similarly significant effects.",
            "Ezriya does not engage in profiling that produces legal or similarly significant effects.",
          ],
        },
        {
          title: "Colorado Residents",
          body: [
            "Under the Colorado Privacy Act (CPA), Colorado residents have the right to access personal data, correct personal data, delete personal data, obtain a portable copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
            "Ezriya honors applicable universal opt-out mechanisms as required by law.",
          ],
        },
        {
          title: "Connecticut Residents",
          body: [
            "Under the Connecticut Data Privacy Act (CTDPA), Connecticut residents have the right to access personal data, correct inaccuracies, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
            "Ezriya does not sell personal data and does not conduct profiling with legal or similarly significant effects.",
          ],
        },
        {
          title: "Utah Residents",
          body: [
            "Under the Utah Consumer Privacy Act (UCPA), Utah residents have the right to access personal data, delete personal data, and opt out of the sale of personal data or targeted advertising.",
            "Ezriya does not sell personal data.",
          ],
        },
        {
          title: "Texas Residents",
          body: [
            "Under the Texas Data Privacy and Security Act (TDPSA), Texas residents have the right to access personal data, correct inaccuracies, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
            "Ezriya does not conduct profiling that produces legal or similarly significant effects.",
          ],
        },
        {
          title: "Oregon Residents",
          body: [
            "Under the Oregon Consumer Privacy Act (OCPA), Oregon residents have the right to access personal data, correct inaccuracies, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
            "Ezriya does not require the submission of sensitive personal data.",
          ],
        },
        {
          title: "Montana Residents",
          body: [
            "Under the Montana Consumer Data Privacy Act (MCDPA), Montana residents have the right to access personal data, correct personal data, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
          ],
        },
        {
          title: "Iowa Residents",
          body: [
            "Under the Iowa Consumer Data Protection Act (ICDPA), Iowa residents have the right to access personal data, delete personal data, and opt out of the sale of personal data.",
            "Ezriya does not sell personal data.",
          ],
        },
        {
          title: "Indiana Residents",
          body: [
            "Under the Indiana Consumer Data Protection Act (ICDPA), Indiana residents have the right to access personal data, correct inaccuracies, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
          ],
        },
        {
          title: "Tennessee Residents",
          body: [
            "Under the Tennessee Information Protection Act (TIPA), Tennessee residents have the right to access personal data, correct personal data, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
          ],
        },
        {
          title: "Kentucky Residents",
          body: [
            "Under the Kentucky Consumer Data Protection Act (KCDPA), Kentucky residents have the right to access personal data, correct inaccuracies, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
          ],
        },
        {
          title: "Delaware Residents",
          body: [
            "Under the Delaware Personal Data Privacy Act (DPDPA), Delaware residents have the right to access personal data, correct inaccuracies, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
          ],
        },
        {
          title: "New Jersey Residents",
          body: [
            "Under the New Jersey Data Privacy Act (NJDPA), New Jersey residents have the right to access personal data, correct inaccuracies, delete personal data, obtain a copy of personal data, and opt out of targeted advertising, sale of personal data, or profiling.",
          ],
        },
        {
          title: "New Hampshire Residents",
          body: [
            "Under the New Hampshire Privacy Act (NHPA), New Hampshire residents have the right to access personal data, correct inaccuracies, delete personal data, obtain a copy of personal data, and opt out of targeted advertising or sale of personal data.",
          ],
        },
        {
          title: "Florida Residents",
          body: [
            "Under the Florida Digital Bill of Rights (FDBR), certain Florida residents may have rights regarding access to personal data, deletion of personal data, and transparency regarding certain automated systems.",
            "Ezriya does not deploy automated systems that make binding decisions.",
          ],
        },
        {
          title: "Exercising Your Rights",
          body: [
            "Consumers may exercise applicable privacy rights by contacting us at support@ezriya.com.",
            "Requests will be processed in accordance with applicable law.",
          ],
        },
      ]}
    />
  );
}
