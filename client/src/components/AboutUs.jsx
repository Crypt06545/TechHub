import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Droplet, ShieldCheck, Clock, MapPin } from "lucide-react";

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
      <section className="grid md:grid-cols-2 gap-10 items-center mb-14">
        <div className="max-w-xl">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">
            About ZUHR
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
            Scent, worn close, never announced.
          </h1>
          <p className="text-gray-500 leading-relaxed">
            ZUHR sells alcohol-free oil attars in Bangladesh. We resell — we
            don't manufacture or create any of the products ourselves.
          </p>
        </div>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
          {/* TODO: replace with actual Cloudinary asset */}
          <img
            src="/images/about/hero-attar.jpg"
            alt="ZUHR attar bottle on a dark surface"
            className="h-full w-full object-cover"
          />
        </div>
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
              region for centuries, but good ones were hard to find.
            </p>
            <p>
              We started ZUHR as a reseller: we source attar and other products
              from suppliers and sell them directly to customers in Bangladesh.
              We don't manufacture or create what we sell.
            </p>
            <p>
              Every attar we sell is oil-based, which is why it lasts on skin
              for hours longer than a standard spray and never carries the sting
              of alcohol on application.
            </p>
          </div>
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
            title="Alcohol-free attars"
            text="Every attar we sell is oil-based, not diluted with alcohol."
          />
          <ValueCard
            icon={ShieldCheck}
            title="We resell, not manufacture"
            text="We don't make or create any of our products. Everything is sourced from suppliers and resold."
          />
          <ValueCard
            icon={Clock}
            title="Built to last the day"
            text="Oil-based attar wears longer on skin than spray perfume."
          />
          <ValueCard
            icon={MapPin}
            title="Shipped from Bangladesh"
            text="Every order is packed in-country, with delivery timelines built around local logistics."
          />
        </div>
      </section>

      <Separator className="mb-14" />

      {/* Beyond attar — resold electronics/accessories */}
      <section className="mb-14">
        <div className="grid md:grid-cols-[200px_1fr] gap-6 md:gap-12">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide pt-1">
            Beyond attar
          </p>
          <div className="max-w-2xl">
            <p className="text-sm text-gray-600 leading-relaxed">
              Alongside attar, we sell everyday electronics and accessories —
              mouse pads, cables, and desk gadgets. These are resold products
              too. We don't manufacture or create anything we sell, whether it's
              attar or electronics.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-xl border border-gray-100 bg-gray-50/60 px-6 py-10 md:px-10 md:py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1.5">
            See the collection
          </h3>
          <p className="text-sm text-gray-500 max-w-sm">
            Rose, oud, amber, and musk-forward attars.
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
