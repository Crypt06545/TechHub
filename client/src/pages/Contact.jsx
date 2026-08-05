import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from "lucide-react";

const InfoRow = ({ icon: Icon, title, lines }) => (
  <div className="flex items-start gap-4">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm shrink-0">
      <Icon className="h-4 w-4 text-gray-700" />
    </div>
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-0.5">{title}</h3>
      {lines.map((line, i) => (
        <p key={i} className="text-sm text-gray-500 leading-relaxed">
          {line}
        </p>
      ))}
    </div>
  </div>
);

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    // TODO: wire to actual backend endpoint, e.g. POST /api/contact
    console.log("Contact form submit:", data);
    setSubmitted(true);
    reset();
  };

  return (
    <div className="container mx-auto px-4 lg:px-6 py-6">
      {/* Hero */}
      <section className="max-w-2xl mb-14">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          Contact
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          Talk to us directly.
        </h1>
        <p className="text-gray-500 leading-relaxed">
          Questions about an order or a product — reach out and we'll get back
          to you, usually within a day.
        </p>
      </section>

      <Separator className="mb-14" />

      <section className="grid md:grid-cols-[320px_1fr] gap-10 md:gap-16 mb-14">
        {/* Info column */}
        <div className="space-y-8">
          <InfoRow icon={Mail} title="Email" lines={["support@zuhrbd.com"]} />
          <InfoRow
            icon={Phone}
            title="Phone / WhatsApp"
            lines={["+880 1XXX-XXXXXX"]}
          />
          <InfoRow
            icon={MapPin}
            title="Location"
            lines={["Bogura, Rajshahi Division, Bangladesh"]}
          />
          <InfoRow
            icon={Clock}
            title="Response hours"
            lines={["Sat – Thu, 10am – 8pm (GMT+6)", "Fri: closed"]}
          />
        </div>

        {/* Form column */}
        <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-6 md:p-8">
          {submitted ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <CheckCircle2 className="h-8 w-8 text-gray-900 mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
                Message sent
              </h3>
              <p className="text-sm text-gray-500 max-w-xs mb-6">
                Thanks for reaching out. We'll get back to you shortly.
              </p>
              <Button
                variant="outline"
                className="h-9 px-5"
                onClick={() => setSubmitted(false)}
              >
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
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

              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-sm text-gray-700">
                  Subject
                </Label>
                <Input
                  id="subject"
                  placeholder="What's this about?"
                  className="bg-white"
                  {...register("subject", { required: "Subject is required" })}
                />
                {errors.subject && (
                  <p className="text-xs text-red-500">
                    {errors.subject.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="message" className="text-sm text-gray-700">
                  Message
                </Label>
                <Textarea
                  id="message"
                  placeholder="Tell us what you need..."
                  rows={5}
                  className="bg-white resize-none"
                  {...register("message", { required: "Message is required" })}
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
                className="bg-gray-900 hover:bg-gray-700 text-white h-10 px-6 w-full sm:w-auto"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? "Sending..." : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </section>

      <Separator className="mb-10" />

      {/* Map */}
      <section className="rounded-xl overflow-hidden border border-gray-100 h-72">
        <iframe
          title="ZUHR location"
          src="https://www.google.com/maps?q=Bogura,Bangladesh&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>
    </div>
  );
};

export default Contact;
