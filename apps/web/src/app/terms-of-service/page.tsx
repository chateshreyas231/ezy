import { InfoPageLayout } from "@/components/site/info-page-layout";

export default function TermsOfServicePage() {
  return (
    <InfoPageLayout
      eyebrow="Legal"
      title="Terms and Conditions"
      subtitle="Effective Date: February 22, 2026"
      updatedAt="February 22, 2026"
      sections={[
        {
          title: "Acceptance of Terms",
          body: [
            'These Terms and Conditions ("Terms") govern access to and use of the Ezriya platform, including all websites, applications, interfaces, APIs, and related services (collectively, the "Platform").',
            "By accessing or using the Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms. If you do not agree, do not access or use the Platform.",
          ],
        },
        {
          title: "1. Platform Purpose and Limitations",
          body: [
            "Ezriya is a technology platform designed to facilitate intent declaration, role-based access, and user-directed coordination in real-estate-related workflows.",
            "Ezriya is a neutral coordination and discovery platform.",
            "Ezriya provides software tools for organizing information and communication.",
            "Ezriya enables users to voluntarily connect based on declared intent.",
            "Ezriya is not a real estate broker, agent, lender, escrow company, or property manager.",
            "Ezriya is not a listing service or multiple listing service.",
            "Ezriya is not a marketplace that markets, promotes, or sells property.",
            "Ezriya does not provide legal, financial, investment, or real estate advice.",
            "Ezriya does not participate in negotiations, pricing, commissions, or compensation.",
            "Ezriya is not a fiduciary or representative of any user.",
            "Ezriya is not a party to any transaction between users.",
            "Ezriya does not control, direct, recommend, endorse, or approve user actions, transactions, or decisions.",
          ],
        },
        {
          title: "2. No Agency, No Representation",
          body: [
            "Use of the Platform does not create an agency relationship, brokerage relationship, fiduciary duty, joint venture, or partnership.",
            "All interactions occur directly between users, and any agreement reached is solely between those users.",
          ],
        },
        {
          title: "3. Eligibility and Compliance",
          body: [
            "You represent that you are at least 18 years old.",
            "You represent that you have the legal capacity to enter binding agreements.",
            "You agree to comply with all applicable federal, state, and local laws.",
            "You are solely responsible for determining whether you are legally permitted to engage in any real-estate-related activity.",
            "Ezriya does not determine user eligibility for regulated activities.",
          ],
        },
        {
          title: "4. User Accounts and Security",
          body: [
            "You are responsible for providing accurate and current information.",
            "You are responsible for maintaining confidentiality of login credentials.",
            "You are responsible for all activity conducted through your account.",
            "Ezriya is not responsible for unauthorized access resulting from your failure to secure your account.",
          ],
        },
        {
          title: "5. User Content and Declarations",
          body: [
            'Users may submit content including profiles, messages, intent declarations, and uploads ("User Content").',
            "You represent and warrant that your User Content is truthful to the best of your knowledge.",
            "You represent and warrant that your User Content does not misrepresent authority, licensure, or role.",
            "You represent and warrant that your User Content does not violate laws or third-party rights.",
            "Ezriya does not verify, endorse, or validate User Content.",
          ],
        },
        {
          title: "6. Intent Declarations and Matching",
          body: [
            "Intent declarations and surfaced connections are informational and user-initiated.",
            "Intent declarations and surfaced connections do not constitute offers, solicitations, or recommendations.",
            "Intent declarations and surfaced connections do not guarantee accuracy, availability, or outcomes.",
            "Ezriya does not determine suitability, priority, or transactional compatibility.",
          ],
        },
        {
          title: "7. AI and Automated Systems",
          body: [
            "Ezriya may use automated systems, including artificial intelligence, to organize user-submitted information.",
            "Ezriya may use automated systems, including artificial intelligence, to surface potential connections based on declared inputs.",
            "Ezriya may use automated systems, including artificial intelligence, to improve platform functionality and performance.",
            "AI outputs are informational only.",
            "AI outputs do not constitute advice, predictions, or guarantees.",
            "AI outputs do not replace human judgment or professional evaluation.",
            "Users remain solely responsible for all decisions and actions.",
          ],
        },
        {
          title: "8. Fees and Payments",
          body: [
            "Ezriya may charge platform access or opt-in fees.",
            "All payments are processed by third-party payment processors.",
            "Payments are not commissions and do not represent participation in transactions.",
            "Payments are not escrow or trust funds.",
            "Ezriya does not hold, manage, or disburse client funds.",
            "Unless otherwise stated, fees are non-refundable.",
          ],
        },
        {
          title: "9. Third-Party Services",
          body: [
            "The Platform may reference or integrate third-party services.",
            "Ezriya does not control third-party services.",
            "Ezriya is not responsible for third-party conduct or performance.",
            "Ezriya does not guarantee availability or outcomes of third-party services.",
            "Use of third-party services is at your own risk.",
          ],
        },
        {
          title: "10. Prohibited Use",
          body: [
            "You may not misrepresent identity, authority, or licensure.",
            "You may not circumvent platform safeguards.",
            "You may not scrape, reverse engineer, or exploit the Platform.",
            "You may not harass, spam, or coerce other users.",
            "You may not use the Platform for unlawful purposes.",
            "Ezriya reserves the right to investigate and enforce violations.",
          ],
        },
        {
          title: "11. Disclaimer of Warranties",
          body: [
            'THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE."',
            "EZRIYA DISCLAIMS ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY OR COMPLETENESS, AND AVAILABILITY OR RELIABILITY.",
            "USE OF THE PLATFORM IS AT YOUR OWN RISK.",
          ],
        },
        {
          title: "12. Limitation of Liability",
          body: [
            "TO THE MAXIMUM EXTENT PERMITTED BY LAW, EZRIYA SHALL NOT BE LIABLE FOR LOST PROFITS OR OPPORTUNITIES, FAILED TRANSACTIONS, USER MISREPRESENTATIONS, OR INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.",
            "TOTAL LIABILITY SHALL NOT EXCEED THE AMOUNT PAID TO EZRIYA IN THE TWELVE MONTHS PRECEDING THE CLAIM.",
          ],
        },
        {
          title: "13. Indemnification",
          body: [
            "You agree to indemnify and hold harmless Ezriya from claims arising from your use of the Platform.",
            "You agree to indemnify and hold harmless Ezriya from claims arising from your User Content.",
            "You agree to indemnify and hold harmless Ezriya from claims arising from your violation of law or these Terms.",
          ],
        },
        {
          title: "14. Termination",
          body: [
            "Ezriya may suspend or terminate access at any time for risk management or violations.",
            "You may discontinue use at any time.",
          ],
        },
        {
          title: "15. Governing Law and Venue",
          body: [
            "These Terms are governed by the laws of the State of Delaware, without regard to conflict-of-law principles.",
          ],
        },
        {
          title: "16. Modifications",
          body: [
            "Ezriya may modify these Terms at any time. Continued use constitutes acceptance.",
          ],
        },
        {
          title: "17. Contact",
          body: [
            "Questions regarding these Terms: connect@ezriya.com",
          ],
        },
      ]}
    />
  );
}
