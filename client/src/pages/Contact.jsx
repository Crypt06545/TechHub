import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Mail,
  MessageCircle,
  MapPin,
  ArrowUpRight,
  Send,
  CheckCircle2,
} from "lucide-react";

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
    console.log("Contact form submit:", data);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setSubmitted(true);
    reset();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 lg:py-20">
      {/* Premium Header */}
      <div className="mb-16 md:mb-24 text-left max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">
          Concierge & Support
        </span>
        <h1 className="mt-3 text-4xl font-light tracking-tight text-zinc-900 md:text-5xl font-serif">
          Get in Touch
        </h1>
        <p className="mt-4 text-base leading-relaxed text-zinc-500 font-light">
          Have a question regarding our fragrance notes, custom orders, or
          delivery status? Reach out directly to our team.
        </p>
      </div>

      {/* Main Grid: Left Direct Channels / Right Clean Form */}
      <div className="grid gap-16 lg:grid-cols-12 lg:gap-24">
        {/* Left Column (Info) */}
        <div className="lg:col-span-5 space-y-12">
          {/* Channel Cards */}
          <div className="space-y-8">
            <div className="border-b border-zinc-100 pb-6">
              <div className="flex items-center gap-3">
                <MessageCircle className="h-4 w-4 text-zinc-900" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  WhatsApp Support
                </h3>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Fastest response for urgent order updates or fragrance
                inquiries.
              </p>
              <a
                href="https://wa.me/8801XXXXXXXXX"
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
              >
                +880 1XXX-XXXXXX <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="border-b border-zinc-100 pb-6">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-zinc-900" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Email Direct
                </h3>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                For corporate inquiries, bulk ordering, or general support.
              </p>
              <a
                href="mailto:support@zuhrbd.com"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 hover:text-zinc-600 transition-colors"
              >
                support@zuhrbd.com <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="border-b border-zinc-100 pb-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-zinc-900" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-zinc-900">
                  Headquarters
                </h3>
              </div>
              <p className="mt-2 text-sm text-zinc-500">
                Bogura, Rajshahi Division, Bangladesh
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Response Hours: Sat – Thu (10 AM – 8 PM)
              </p>
            </div>
          </div>

          {/* Minimalist FAQ Accordion */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-4">
              Frequently Asked
            </h4>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-zinc-900">
                  How long do deliveries take?
                </p>
                <p className="mt-1 text-zinc-500 text-xs leading-relaxed">
                  2-3 days inside Dhaka & Bogura, 3-5 days across rest of
                  Bangladesh.
                </p>
              </div>
              <div>
                <p className="font-medium text-zinc-900">
                  Testing bottle policy?
                </p>
                <p className="mt-1 text-zinc-500 text-xs leading-relaxed">
                  Try the testing vial first. If unopened, full bottle can be
                  returned at doorstep.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Minimal Modern Form) */}
        <div className="lg:col-span-7">
          {submitted ? (
            <div className="rounded-2xl border border-zinc-100 bg-zinc-50/50 p-10 text-center">
              <CheckCircle2 className="mx-auto mb-4 h-8 w-8 text-zinc-900" />
              <h3 className="text-lg font-semibold text-zinc-900">
                Message Received
              </h3>
              <p className="mt-2 text-sm text-zinc-500 max-w-sm mx-auto">
                Thank you for reaching out. We aim to respond within 24 hours.
              </p>
              <Button
                variant="outline"
                className="mt-6 rounded-none border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white"
                onClick={() => setSubmitted(false)}
              >
                Send Another Message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-xs font-medium uppercase tracking-wider text-zinc-700"
                  >
                    Your Name
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g. Mehadi Hasan"
                    className="h-11 rounded-none border-0 border-b border-zinc-200 bg-transparent px-0 focus-visible:border-zinc-900 focus-visible:ring-0 shadow-none"
                    {...register("name", { required: "Name is required" })}
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-xs font-medium uppercase tracking-wider text-zinc-700"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="h-11 rounded-none border-0 border-b border-zinc-200 bg-transparent px-0 focus-visible:border-zinc-900 focus-visible:ring-0 shadow-none"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Invalid email",
                      },
                    })}
                  />
                  {errors.email && (
                    <p className="text-xs text-rose-500">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="subject"
                    className="text-xs font-medium uppercase tracking-wider text-zinc-700"
                  >
                    Topic
                  </Label>
                  <select
                    id="subject"
                    defaultValue=""
                    className="h-11 w-full border-0 border-b border-zinc-200 bg-transparent px-0 text-sm text-zinc-900 outline-none focus:border-zinc-900 focus:ring-0"
                    {...register("subject", { required: "Select a topic" })}
                  >
                    <option value="" disabled>
                      Select Subject
                    </option>
                    <option value="order">Order Inquiry</option>
                    <option value="fragrance">Fragrance Consultation</option>
                    <option value="returns">Returns & Tester</option>
                    <option value="wholesale">Wholesale & Business</option>
                  </select>
                  {errors.subject && (
                    <p className="text-xs text-rose-500">
                      {errors.subject.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="orderNumber"
                    className="text-xs font-medium uppercase tracking-wider text-zinc-700"
                  >
                    Order #{" "}
                    <span className="text-zinc-400 font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Input
                    id="orderNumber"
                    placeholder="ZUHR-10432"
                    className="h-11 rounded-none border-0 border-b border-zinc-200 bg-transparent px-0 focus-visible:border-zinc-900 focus-visible:ring-0 shadow-none"
                    {...register("orderNumber")}
                  />
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <Label
                    htmlFor="message"
                    className="text-xs font-medium uppercase tracking-wider text-zinc-700"
                  >
                    Message
                  </Label>
                  <span className="text-[10px] text-zinc-400">
                    {messageLength}/500
                  </span>
                </div>
                <Textarea
                  id="message"
                  placeholder="How can we assist you today?"
                  rows={4}
                  maxLength={500}
                  className="rounded-none border-0 border-b border-zinc-200 bg-transparent px-0 focus-visible:border-zinc-900 focus-visible:ring-0 shadow-none resize-none"
                  {...register("message", { required: "Message is required" })}
                />
                {errors.message && (
                  <p className="text-xs text-rose-500">
                    {errors.message.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 h-12 w-full sm:w-auto px-8 rounded-none bg-zinc-900 text-white hover:bg-zinc-800 transition-colors tracking-wider text-xs uppercase"
              >
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;
