import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Droplet, Leaf, Clock, MapPin } from "lucide-react";

const ProcessStep = ({ index, total, title, text }) => (
  <div className="relative pl-8">
    <div className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-gray-900" />
    {index < total - 1 && (
      <div className="absolute left-[3px] top-4 bottom-[-2.25rem] w-px bg-gray-200" />
    )}
    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
      Step {String(index + 1).padStart(2, "0")}
    </p>
    <h3 className="text-lg font-semibold text-gray-900 mb-1.5">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed max-w-md">{text}</p>
  </div>
);

const ValueCard = ({ icon: Icon, title, text }) => (
  <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-6 hover:border-gray-300 transition-colors">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white shadow-sm mb-3">
      <Icon className="h-4 w-4 text-gray-700" />
    </div>
    <h3 className="font-semibold text-gray-900 mb-1.5">{title}</h3>
    <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
  </div>
);

const AboutUs = () => {
  return (
    <div className="container mx-auto px-4 lg:px-6 py-6">
      {/* Hero */}
      <section className="max-w-2xl mb-14">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
          About ZUHR
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
          Scent, worn close, never announced.
        </h1>
        <p className="text-gray-500 leading-relaxed">
          ZUHR makes alcohol-free oil attars in Bangladesh — concentrated,
          long-wearing, and built to sit on skin rather than hang in the air. No
          spray, no rush, no compromise on what goes into the oil.
        </p>
      </section>

      <Separator className="mb-14" />

      {/* Origin */}
      <section className="mb-14">
        <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-12">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-1">
            Where it started
          </p>
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed max-w-2xl">
            <p>
              ZUHR began with a simple frustration: most perfume sold in
              Bangladesh was either imported at a markup that priced out
              everyday wear, or diluted with alcohol that faded within the hour.
              Attar — oil-based, alcohol-free perfumery — has existed in this
              region for centuries, but good ones were hard to find and harder
              to trust.
            </p>
            <p>
              We started ZUHR to make that tradition rigorous again: real
              concentration, ingredients we can name, and bottles that don't ask
              you to guess what's inside.
            </p>
            <p>
              Every attar we sell is oil-based by design — not a marketing
              claim, but the actual format, which is why it lasts on skin for
              hours longer than a standard spray and never carries the sting of
              alcohol on application.
            </p>
          </div>
        </div>
      </section>

      <Separator className="mb-14" />

      {/* Craft process — real sequence */}
      <section className="mb-14">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          How an attar is made
        </p>
        <h2 className="text-xl font-bold text-gray-900 mb-10 max-w-md">
          Four steps, no shortcuts taken in any of them.
        </h2>

        <div className="space-y-10 max-w-md">
          <ProcessStep
            index={0}
            total={4}
            title="Sourcing"
            text="Raw materials — oud wood, rose, sandalwood, amber resin — are sourced from growers we can trace back to, not blended from anonymous bulk stock."
          />
          <ProcessStep
            index={1}
            total={4}
            title="Extraction"
            text="Oils are drawn out through slow steam distillation or cold expression, depending on the material."
          />
          <ProcessStep
            index={2}
            total={4}
            title="Aging"
            text="The extracted oil rests for weeks to months, letting sharper top notes settle and the base deepen."
          />
          <ProcessStep
            index={3}
            total={4}
            title="Bottling"
            text="Bottled in small batches by hand, checked for concentration and clarity before it's sealed."
          />
        </div>
      </section>

      <Separator className="mb-14" />

      {/* Values */}
      <section className="mb-14">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">
          What we hold to
        </p>
        <h2 className="text-xl font-bold text-gray-900 mb-8 max-w-md">
          The parts we don't compromise on.
        </h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <ValueCard
            icon={Droplet}
            title="Alcohol-free, always"
            text="Every ZUHR attar is 100% oil-based. Nothing is cut with alcohol to stretch volume or lower cost."
          />
          <ValueCard
            icon={Clock}
            title="Built to last the day"
            text="Oil binds to skin differently than spray. Expect 8–12 hours of wear from a proper attar, not two."
          />
          <ValueCard
            icon={Leaf}
            title="Traceable ingredients"
            text="We can tell you what's in a bottle and roughly where it came from. If we can't, we don't sell it."
          />
          <ValueCard
            icon={MapPin}
            title="Made and shipped from Bangladesh"
            text="Every order is packed in-country, with delivery timelines built around local logistics."
          />
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl border border-gray-100 bg-gray-50/60 px-6 py-10 md:px-10 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
            See the collection
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Rose, oud, amber, and musk-forward attars — each one built the same
            four-step way.
          </p>
        </div>
        <Button
          asChild
          className="bg-gray-900 hover:bg-gray-700 text-white h-10 px-6 shrink-0"
        >
          <Link to="/products">Shop attars</Link>
        </Button>
      </section>
    </div>
  );
};

export default AboutUs;
