import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import {
  Droplets,
  ShieldCheck,
  RefreshCcw,
  Truck,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Package,
  ArrowUpRight,
  ArrowRight,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────
// Static content — separated from layout so it can move to a CMS later
// without touching markup.
// ─────────────────────────────────────────────────────────────────────────

const LAST_UPDATED = "January 2026";

const SECTIONS = [
  { id: "coverage", label: "Service coverage" },
  { id: "channels", label: "Support channels" },
  { id: "quality", label: "Quality guarantee" },
  { id: "damage", label: "Damaged or leaking bottles" },
  { id: "wrong-item", label: "Wrong item support" },
  { id: "timeline", label: "Service timeline" },
  { id: "responsibilities", label: "Customer responsibilities" },
  { id: "limitations", label: "Service limitations" },
  { id: "shipping", label: "Shipping for returns" },
];

const COVERAGE = [
  "Order and delivery issue resolution",
  "Replacement for damaged, leaking, or defective bottles",
  "Correction for wrong or missing items",
  "Authenticity and quality concerns",
  "Guidance on applying, layering, and storing your attar",
];

const CHANNELS = [
  {
    icon: Mail,
    title: "Email support",
    value: "support@zuhrbd.com",
    href: "mailto:support@zuhrbd.com",
    cta: "Send an email",
  },
  {
    icon: Phone,
    title: "Phone / Hotline",
    value: "+880 1XXX-XXXXXX",
    href: "tel:+8801XXXXXXXXX",
    cta: "Call now",
  },
  {
    icon: MessageCircle,
    title: "Live chat / social media",
    value: "WhatsApp & Facebook",
    href: "https://wa.me/8801XXXXXXXXX",
    cta: "Start a chat",
  },
];

const TIMELINE = [
  {
    step: "01",
    title: "Initial response",
    duration: "24 – 48 hours",
    body: "We acknowledge your message and let you know what proof — usually a photo or short video — we'll need to move forward.",
  },
  {
    step: "02",
    title: "Review & verification",
    duration: "1 – 3 working days",
    body: "We check your order ID and the photos/videos you've shared to confirm the issue before approving next steps.",
  },
  {
    step: "03",
    title: "Replacement or resolution",
    duration: "3 – 7 working days",
    body: "Once approved, your replacement bottle ships out, or your case is resolved — timing depends on stock and your location.",
  },
];

const RESPONSIBILITIES = [
  "Report the issue as soon as it's noticed — ideally within 48 hours of delivery",
  "Share clear photos or a short video of the damaged bottle, packaging, and label",
  "Keep your order ID or invoice on hand for verification",
  "Store attar away from direct sunlight and heat, as advised on the label",
];

const LIMITATIONS = [
  "Change of mind after the main bottle has been opened — please use the testing bottle first to decide",
  "Damage caused by improper storage, such as heat or direct sunlight exposure",
  "Natural scent settling or minor color change over long-term storage, which does not affect quality",
];

const SHIPPING_TERMS = [
  {
    label: "Covered by ZUHR",
    body: "If a bottle arrives damaged, leaking, or incorrect, we cover the cost of shipping your replacement.",
    positive: true,
  },
  {
    label: "Paid by customer",
    body: "For preference-based returns not covered by this policy, return shipping is the customer's responsibility.",
    positive: false,
  },
];

// ─────────────────────────────────────────────────────────────────────────

const SectionHeading = ({ id, icon: Icon, title }) => (
  <div id={id} className="mb-5 flex scroll-mt-24 items-center gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900">
      <Icon className="h-4 w-4 text-white" />
    </div>
    <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
  </div>
);

const AfterSalesSupport = () => {
  return (
    <div className="container mx-auto px-4 py-6 lg:px-6">
      {/* Hero */}
      <section className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          Customer care
        </p>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          After-Sales Support Policy
        </h1>
        <p className="leading-relaxed text-gray-500">
          At ZUHR, every bottle is meant to arrive exactly as it should —
          sealed, intact, and true to the scent you ordered. If something goes
          wrong, here's exactly how we make it right, with nothing to guess.
        </p>
        <p className="mt-4 text-xs text-gray-400">
          Last updated: {LAST_UPDATED}
        </p>
      </section>

      <Separator className="mb-10" />

      {/* Table of contents */}
      <nav className="mb-14 rounded-xl border border-gray-100 bg-gray-50/60 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
          On this page
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="text-sm text-gray-600 underline-offset-4 hover:text-gray-900 hover:underline"
            >
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Service coverage */}
      <section className="mb-14">
        <SectionHeading
          id="coverage"
          icon={Droplets}
          title="Service coverage"
        />
        <p className="mb-5 max-w-2xl text-sm text-gray-500">
          Our after-sales support covers the full journey after your order is
          placed, not just the moment it's delivered.
        </p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {COVERAGE.map((item) => (
            <li
              key={item}
              className="flex items-start gap-2.5 rounded-lg border border-gray-100 bg-white p-3.5"
            >
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              <span className="text-sm text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Support channels */}
      <section className="mb-14">
        <SectionHeading
          id="channels"
          icon={MessageCircle}
          title="Support channels"
        />
        <p className="mb-5 max-w-2xl text-sm text-gray-500">
          Reach us however's easiest — every channel routes to the same support
          team.
        </p>
        <div className="grid gap-4 sm:grid-cols-3">
          {CHANNELS.map(({ icon: Icon, title, value, href, cta }) => (
            <a
              key={title}
              href={href}
              target={href.startsWith("http") ? "_blank" : undefined}
              rel={href.startsWith("http") ? "noreferrer" : undefined}
              className="group flex flex-col justify-between rounded-xl border border-gray-100 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-gray-200 hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-gray-900">
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{value}</p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gray-900">
                {cta}
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </a>
          ))}
        </div>
        <p className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          Our team responds within 24–48 hours on business days.
        </p>
      </section>

      <Separator className="mb-14" />

      {/* Quality / Damage / Wrong item */}
      <section className="mb-14 grid gap-6 md:grid-cols-3">
        <div
          id="quality"
          className="scroll-mt-24 rounded-xl border border-gray-100 bg-white p-6"
        >
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900">
            <ShieldCheck className="h-4 w-4 text-white" />
          </div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Quality guarantee
          </h3>
          <ul className="space-y-2.5 text-sm leading-relaxed text-gray-500">
            <li>
              Every bottle is checked before it ships, so what you receive
              matches what you ordered.
            </li>
            <li>
              Concerns about authenticity or scent quality are reviewed case by
              case with your order ID.
            </li>
            <li>
              Confirmed quality issues are resolved with a replacement, at no
              extra cost.
            </li>
          </ul>
        </div>

        <div
          id="damage"
          className="scroll-mt-24 rounded-xl border border-gray-100 bg-white p-6"
        >
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900">
            <Droplets className="h-4 w-4 text-white" />
          </div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Damaged or leaking bottles
          </h3>
          <ul className="space-y-2.5 text-sm leading-relaxed text-gray-500">
            <li>
              If a bottle arrives cracked, leaking, or the seal is broken,
              you're covered for a free replacement.
            </li>
            <li>
              A photo of the bottle and its packaging is usually enough to
              confirm the issue.
            </li>
            <li>Replacements are sent out once verification is complete.</li>
          </ul>
        </div>

        <div
          id="wrong-item"
          className="scroll-mt-24 rounded-xl border border-gray-100 bg-white p-6"
        >
          <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900">
            <RefreshCcw className="h-4 w-4 text-white" />
          </div>
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Wrong item support
          </h3>
          <ul className="space-y-2.5 text-sm leading-relaxed text-gray-500">
            <li>
              Received a different scent or size than what you ordered? We'll
              correct it at no cost.
            </li>
            <li>Subject to stock availability for the correct item.</li>
            <li>Processed as soon as the order details are confirmed.</li>
          </ul>
        </div>
      </section>

      <Separator className="mb-14" />

      {/* Service timeline */}
      <section className="mb-14">
        <SectionHeading id="timeline" icon={Clock} title="Service timeline" />
        <p className="mb-6 max-w-2xl text-sm text-gray-500">
          What to expect, start to finish, once you report an issue.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          {TIMELINE.map(({ step, title, duration, body }, i) => (
            <div
              key={step}
              className="relative rounded-xl border border-gray-100 bg-white p-5"
            >
              <span className="text-xs font-semibold text-gray-300">
                {step}
              </span>
              <h3 className="mt-2 text-sm font-semibold text-gray-900">
                {title}
              </h3>
              <p className="mt-1 text-xs font-medium text-gray-900">
                {duration}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {body}
              </p>
              {i < TIMELINE.length - 1 && (
                <ArrowRight className="absolute -right-3 top-1/2 hidden h-4 w-4 -translate-y-1/2 text-gray-200 md:block" />
              )}
            </div>
          ))}
        </div>
      </section>

      <Separator className="mb-14" />

      {/* Responsibilities + Limitations */}
      <section className="mb-14 grid gap-10 md:grid-cols-2">
        <div id="responsibilities" className="scroll-mt-24">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-900">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Customer responsibilities
            </h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            A smooth resolution is a two-way street. To help us help you
            quickly:
          </p>
          <ul className="space-y-2.5">
            {RESPONSIBILITIES.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div id="limitations" className="scroll-mt-24">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Service limitations
            </h2>
          </div>
          <p className="mb-4 text-sm text-gray-500">
            This policy does not cover the following:
          </p>
          <ul className="space-y-2.5">
            {LIMITATIONS.map((item) => (
              <li key={item} className="flex items-start gap-2.5">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                <span className="text-sm text-gray-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <Separator className="mb-14" />

      {/* Shipping for returns */}
      <section className="mb-14">
        <SectionHeading
          id="shipping"
          icon={Truck}
          title="Shipping for returns"
        />
        <p className="mb-5 max-w-2xl text-sm text-gray-500">
          If a bottle needs to be sent back for review, here's how shipping
          costs are handled.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {SHIPPING_TERMS.map(({ label, body, positive }) => (
            <div
              key={label}
              className={`rounded-xl border p-5 ${
                positive
                  ? "border-emerald-100 bg-emerald-50/50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <div className="mb-2 flex items-center gap-2">
                <Package
                  className={`h-4 w-4 ${
                    positive ? "text-emerald-600" : "text-gray-500"
                  }`}
                />
                <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
              </div>
              <p className="text-sm leading-relaxed text-gray-600">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Commitment */}
      <section className="mb-10 rounded-xl border border-gray-100 bg-gray-50/60 p-6 md:p-8">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
          Our commitment
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-gray-700">
          We prioritize customer satisfaction and aim to resolve every issue
          efficiently and fairly. Each case is handled with care, from first
          message to final outcome.
        </p>
      </section>

      {/* Policy updates */}
      <section className="mb-10">
        <p className="text-xs leading-relaxed text-gray-400">
          ZUHR reserves the right to update or modify this policy at any time.
          Continued use of our services indicates acceptance of these terms.
        </p>
      </section>

      {/* CTA */}
      <section className="flex flex-col items-start justify-between gap-4 rounded-xl border border-gray-100 bg-white p-6 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">
            Still have a question?
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Our support team is ready to help with your specific case.
          </p>
        </div>
        <Link
          to="/contact"
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md bg-gray-900 px-6 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Contact support
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
};

export default AfterSalesSupport;
