import { useState } from "react";
import { Separator } from "@/components/ui/separator";

const sections = [
  {
    id: "information-we-collect",
    title: "Information We Collect",
    body: (
      <>
        <p>When you browse ZUHR or place an order, we collect:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-3">
          <li>
            <strong className="text-gray-900">Contact details</strong> — name,
            phone number, email, and delivery address, provided when you check
            out or create an account.
          </li>
          <li>
            <strong className="text-gray-900">Order information</strong> —
            products purchased, order value, and payment method (bKash, Nagad,
            card, or cash on delivery).
          </li>
          <li>
            <strong className="text-gray-900">Payment data</strong> — for card
            and mobile-banking payments, transactions are processed directly by
            our payment partner. ZUHR does not store your full card number or
            banking PIN on our servers.
          </li>
          <li>
            <strong className="text-gray-900">Usage data</strong> — pages
            visited, device type, and approximate location, collected
            automatically through Google Analytics.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-we-use-information",
    title: "How We Use Your Information",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>To process, pack, and deliver your order.</li>
        <li>To contact you about order status, delivery, or issues.</li>
        <li>
          To send you offers or updates, only if you've opted in — you can
          unsubscribe at any time.
        </li>
        <li>
          To understand which products and pages perform well, so we can improve
          the site.
        </li>
        <li>To prevent fraud and resolve payment or delivery disputes.</li>
      </ul>
    ),
  },
  {
    id: "cookies-tracking",
    title: "Cookies & Tracking",
    body: (
      <>
        <p>
          ZUHR uses cookies to keep your cart working between pages and to
          understand site traffic through Google Analytics. Cookies do not give
          us access to your device beyond what's needed for these purposes.
        </p>
        <p className="mt-3">
          You can disable cookies in your browser settings. Some site features,
          like keeping items in your cart, may not work correctly if you do.
        </p>
      </>
    ),
  },
  {
    id: "sharing-your-information",
    title: "Sharing Your Information",
    body: (
      <>
        <p>We do not sell your personal information. We share it only with:</p>
        <ul className="list-disc pl-5 space-y-1.5 mt-3">
          <li>
            <strong className="text-gray-900">Delivery partners</strong> — your
            name, phone number, and address, so your order can reach you.
          </li>
          <li>
            <strong className="text-gray-900">Payment processors</strong> — to
            complete mobile-banking or card transactions securely.
          </li>
          <li>
            <strong className="text-gray-900">
              Analytics providers (Google Analytics)
            </strong>{" "}
            — anonymized usage data to help us understand site performance.
          </li>
          <li>
            <strong className="text-gray-900">Legal authorities</strong> — only
            if required by law or to protect against fraud.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "data-security",
    title: "Data Security",
    body: (
      <p>
        We use industry-standard measures, including encrypted checkout (HTTPS)
        and restricted internal access, to protect your data. No online system
        is 100% risk-free, but we do not store sensitive payment credentials on
        our own servers and limit access to customer data to staff who need it
        to fulfil your order.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your Rights & Choices",
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>Request a copy of the personal data we hold about you.</li>
        <li>Ask us to correct inaccurate information.</li>
        <li>
          Ask us to delete your account and associated data, subject to records
          we're legally required to keep (such as order and tax history).
        </li>
        <li>Opt out of marketing emails or SMS at any time.</li>
      </ul>
    ),
  },
  {
    id: "childrens-privacy",
    title: "Children's Privacy",
    body: (
      <p>
        ZUHR is intended for users 18 and older. We do not knowingly collect
        personal information from children. If you believe a child has provided
        us with personal data, contact us and we will remove it.
      </p>
    ),
  },
  {
    id: "changes-to-this-policy",
    title: "Changes to This Policy",
    body: (
      <p>
        We may update this policy as our practices or legal requirements change.
        The "Last updated" date below will always reflect the most recent
        revision. Continued use of ZUHR after changes means you accept the
        updated policy.
      </p>
    ),
  },
  {
    id: "contact-us",
    title: "Contact Us",
    body: (
      <p>
        For questions about this policy or your data, reach us at{" "}
        <a
          href="mailto:privacy@zuhrbd.com"
          className="text-gray-900 underline underline-offset-2 hover:text-gray-600"
        >
          privacy@zuhrbd.com
        </a>{" "}
        or through the contact form on our site.
      </p>
    ),
  },
];

const PrivacyPolicy = () => {
  const [activeId, setActiveId] = useState(sections[0].id);

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="mb-10">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Legal
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500">
          Last updated: July 24, 2026 · Applies to zuhrbd.com and all ZUHR
          orders placed in Bangladesh
        </p>
      </div>

      <Separator className="mb-10" />

      {/* TOC + Content */}
      <div className="grid md:grid-cols-[200px_1fr] gap-10 mb-16">
        {/* Table of contents */}
        <nav className="hidden md:block sticky top-8 self-start">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            On this page
          </p>
          <ul className="space-y-2 text-sm">
            {sections.map((s, i) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setActiveId(s.id)}
                  className={`block leading-snug transition-colors ${
                    activeId === s.id
                      ? "text-gray-900 font-medium"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}. {s.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Sections */}
        <div className="space-y-10">
          <p className="text-sm text-gray-600 leading-relaxed pb-8 border-b border-gray-100">
            This policy explains what personal information ZUHR collects when
            you shop with us, how we use it, and the choices you have. By using
            zuhrbd.com or placing an order with us, you agree to the practices
            described below.
          </p>

          {sections.map((s, i) => (
            <div key={s.id} id={s.id} className="scroll-mt-8">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">
                {String(i + 1).padStart(2, "0")}
              </p>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                {s.title}
              </h2>
              <div className="text-sm text-gray-600 leading-relaxed">
                {s.body}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
