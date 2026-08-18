import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  ArrowUpRight,
  MessageCircle,
  Package,
  Sparkles,
  Users,
  ShieldCheck,
  Timer,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────
// Static content — kept out of JSX so the component stays readable and this
// data can later move to a CMS / API without touching layout code.
// ─────────────────────────────────────────────────────────────────────────

const CONTACT_METHODS = [
  {
    icon: Mail,
    title: "Email",
    value: "support@zuhrbd.com",
    detail: "Best for detailed questions or order documentation.",
    href: "mailto:support@zuhrbd.com",
    cta: "Send an email",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp",
    value: "+880 1XXX-XXXXXX",
    detail: "Fastest way to reach us — usually a reply within the hour.",
    href: "https://wa.me/8801XXXXXXXXX",
    cta: "Start a chat",
  },
  {
    icon: MapPin,
    title: "Visit us",
    value: "Bogura, Rajshahi Division",
    detail: "By appointment — message us first so someone's here.",
    href: "https://www.google.com/maps?q=Bogura,Bangladesh",
    cta: "Get directions",
  },
];

const DEPARTMENTS = [
  {
    icon: Package,
    label: "Order & delivery",
    body: "Tracking, delayed parcels, cash-on-delivery questions.",
  },
  {
    icon: Sparkles,
    label: "Product & fragrance guidance",
    body: "Notes, longevity, or help picking between two attars.",
  },
  {
    icon: ShieldCheck,
    label: "Returns & testing bottle",
    body: "Didn't love the scent? We'll walk you through the return.",
  },
  {
    icon: Users,
    label: "Wholesale & partnerships",
    body: "Bulk orders, gifting, or stocking ZUHR at your store.",
  },
];

const HOURS = [
  { day: "Saturday – Thursday", time: "10:00 AM – 8:00 PM" },
  { day: "Friday", time: "Closed" },
];

const FAQS = [
  {
    q: "How long until I hear back?",
    a: "Email replies land within one business day. WhatsApp is usually much faster — often within the hour during our open hours listed below.",
  },
  {
    q: "Can I change or cancel an order after placing it?",
    a: "Yes, as long as it hasn't been handed to the courier yet. Message us with your order number and we'll sort it out right away.",
  },
  {
    q: "I received the testing bottle but not the full size — is that normal?",
    a: "That's exactly how it works. Try the tester first; if you love it, pay for the full bottle on delivery. If not, just return it unopened.",
  },
  {
    q: "Do you take wholesale or corporate gifting orders?",
    a: 'We do. Use the form and select "Wholesale & partnerships" as the subject, and include your expected quantity so we can quote you properly.',
  },
];

const InfoRow = ({ icon: Icon, title, lines }) => (
  <div className="flex items-start gap-4">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
      <Icon className="h-4 w-4 text-gray-700" />
    </div>
    <div>
      <h3 className="mb-0.5 text-sm font-semibold text-gray-900">{title}</h3>
      {lines.map((line, i) => (
        <p key={i} className="text-sm leading-relaxed text-gray-500">
          {line}
        </p>
      ))}
    </div>
  </div>
);

const ContactMethodCard = ({ icon: Icon, title, value, detail, href, cta }) => (
  <a
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
      <p className="mt-1 text-sm font-medium text-gray-700">{value}</p>
      <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{detail}</p>
    </div>

    <span className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-gray-900">
      {cta}
      <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </span>
  </a>
);

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const messageLength = watch("message")?.length ?? 0;

  const onSubmit = async (data) => {
    // TODO: wire to actual backend endpoint, e.g. POST /api/contact
    console.log("Contact form submit:", data);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmitted(true);
    reset();
  };

  return (
    <div className="container mx-auto px-4 py-6 lg:px-6">
      {/* Hero */}
      <section className="mb-10 max-w-2xl">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-gray-400">
          Contact ZUHR
        </p>
        <h1 className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl">
          Talk to a real person, not a ticket queue.
        </h1>
        <p className="leading-relaxed text-gray-500">
          Order status, fragrance advice, returns, or a bulk order for an event
          — whatever it is, tell us and we'll take it from there. Every message
          reaches our small team directly.
        </p>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
          <span className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <Timer className="h-3.5 w-3.5 text-emerald-600" />
            Avg. reply time: under 24 hours
          </span>
          <span className="flex items-center gap-2 text-xs font-medium text-gray-600">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            Real support team, based in Bangladesh
          </span>
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Quick contact methods */}
      <section className="mb-14 grid gap-4 sm:grid-cols-3">
        {CONTACT_METHODS.map((method) => (
          <ContactMethodCard key={method.title} {...method} />
        ))}
      </section>

      {/* Departments + Hours + Form */}
      <section className="mb-14 grid gap-10 md:grid-cols-[320px_1fr] md:gap-16">
        {/* Left: what we help with + hours */}
        <div className="space-y-10">
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              What can we help with?
            </h2>
            <div className="space-y-4">
              {DEPARTMENTS.map(({ icon: Icon, label, body }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100">
                    <Icon className="h-3.5 w-3.5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{label}</p>
                    <p className="text-xs leading-relaxed text-gray-500">
                      {body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <InfoRow
            icon={Clock}
            title="Response hours"
            lines={HOURS.map((h) => `${h.day} · ${h.time}`)}
          />

          <p className="text-xs leading-relaxed text-gray-400">
            Messages sent outside these hours are queued and answered first
            thing when we're back online.
          </p>
        </div>

        {/* Right: form */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-6 md:p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle2 className="mb-3 h-8 w-8 text-gray-900" />
              <h3 className="mb-1.5 text-lg font-semibold text-gray-900">
                Message sent
              </h3>
              <p className="mb-1 max-w-xs text-sm text-gray-500">
                Thanks for reaching out. We'll get back to you within one
                business day.
              </p>
              <p className="mb-6 max-w-xs text-xs text-gray-400">
                Need it sooner? WhatsApp us — it's usually the fastest way to
                reach the team.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="outline"
                  className="h-9 px-5"
                  onClick={() => setSubmitted(false)}
                >
                  Send another message
                </Button>
                <Button
                  asChild
                  className="h-9 bg-gray-900 px-5 text-white hover:bg-gray-700"
                >
                  <a
                    href="https://wa.me/8801XXXXXXXXX"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Message on WhatsApp
                  </a>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm text-gray-700">
                    Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    className="bg-white"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="text-xs text-red-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm text-gray-700">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="bg-white"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Enter a valid email",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-xs text-red-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="subject" className="text-sm text-gray-700">
                    What's this about?
                  </Label>
                  <select
                    id="subject"
                    defaultValue=""
                    className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-sm text-gray-900 outline-none ring-0 focus:border-gray-400"
                    {...register("subject", {
                      required: "Please choose a subject",
                    })}
                  >
                    <option value="" disabled>
                      Select a topic
                    </option>
                    <option value="order">Order & delivery</option>
                    <option value="product">Product & fragrance advice</option>
                    <option value="returns">Returns & testing bottle</option>
                    <option value="wholesale">Wholesale & partnerships</option>
                    <option value="other">Something else</option>
                  </select>
                  {errors.subject && (
                    <p className="text-xs text-red-500">
                      {errors.subject.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="orderNumber"
                    className="text-sm text-gray-700"
                  >
                    Order number{" "}
                    <span className="text-gray-400">(optional)</span>
                  </Label>
                  <Input
                    id="orderNumber"
                    placeholder="e.g. ZUHR-10432"
                    className="bg-white"
                    {...register("orderNumber")}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <Label htmlFor="message" className="text-sm text-gray-700">
                    Message
                  </Label>
                  <span className="text-xs text-gray-400">
                    {messageLength}/500
                  </span>
                </div>
                <Textarea
                  id="message"
                  placeholder="Tell us what you need — the more detail, the faster we can help."
                  rows={5}
                  maxLength={500}
                  className="resize-none bg-white"
                  {...register("message", {
                    required: "Message is required",
                    minLength: {
                      value: 10,
                      message: "Give us a little more detail (10+ characters)",
                    },
                  })}
                />
                {errors.message && (
                  <p className="text-xs text-red-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-10 w-full bg-gray-900 px-6 text-white hover:bg-gray-700 sm:w-auto"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Sending..." : "Send message"}
              </Button>

              <p className="text-xs leading-relaxed text-gray-400">
                By submitting, you agree to be contacted about this inquiry. We
                don't share your details with anyone outside ZUHR.
              </p>
            </form>
          )}
        </div>
      </section>

      <Separator className="mb-14" />

      {/* FAQ */}
      <section className="mb-14">
        <h2 className="mb-1 text-lg font-semibold text-gray-900">
          Before you write in
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          A few quick answers that might save you a message.
        </p>

        <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group p-5 open:bg-gray-50/60">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium text-gray-900">
                {q}
                <span className="ml-4 shrink-0 text-gray-400 transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Map */}
      <section>
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Find us</h2>
        <div className="h-72 overflow-hidden rounded-xl border border-gray-100">
          <iframe
            title="ZUHR location"
            src="https://www.google.com/maps?q=Bogura,Bangladesh&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>
    </div>
  );
};

export default Contact;
