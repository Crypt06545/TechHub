import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const AboutUs = () => {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12 md:px-6 lg:py-20">
      {/* Brand Motto Hero */}
      <section className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          About ZUHR
        </span>
        <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight text-foreground leading-[1.15]">
          Rooted in Sunnah. <br />
          Trusted for purity.
        </h1>
        <p className="mt-6 text-base md:text-lg text-muted-foreground font-light leading-relaxed max-w-2xl mx-auto">
          ZUHR brings alcohol-free, long-lasting oil attars to daily wear in
          Bangladesh. Pure ingredients, honest curation, and timeless fragrance.
        </p>
      </section>

      {/* Hero Image */}
      <section className="mb-20">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-muted shadow-sm">
          <img
            src="/images/about/hero-attar.jpg"
            alt="ZUHR attar bottle"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* Origin & Reseller Transparency */}
      <section className="mb-20">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] md:gap-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-1">
            Our Foundation
          </span>
          <div className="space-y-6 text-sm md:text-base leading-relaxed text-muted-foreground font-light">
            <p className="text-foreground font-normal text-base md:text-lg">
              Attar is more than fragrance it is a timeless tradition and a
              honored Sunnah. Yet finding pure, alcohol-free oil that lasts
              throughout the day without heavy markups was surprisingly
              difficult.
            </p>
            <p>
              We created ZUHR to bridge that gap. As a dedicated reseller, we
              carefully source oil-based attars directly from trusted suppliers
              and artisans, delivering authentic quality straight to your door
              across Bangladesh.
            </p>
            <p>
              We don't manufacture or dilute what we sell. Every bottle is
              chosen for its longevity, richness, and 100% alcohol free
              formulation staying true to skin and tradition.
            </p>
          </div>
        </div>
      </section>

      <Separator className="mb-20" />

      {/* Core Values (Clean Typography - No Generic Icons) */}
      <section className="mb-20">
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            What Defines Us
          </span>
          <h2 className="mt-2 text-2xl font-serif text-foreground font-medium">
            Purity in every detail
          </h2>
        </div>

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="border-l-2 border-foreground/20 pl-5 py-1">
            <h3 className="text-sm font-semibold text-foreground">
              100% Alcohol-Free
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Pure oil formulations that wear close to skin without harsh
              synthetic stings.
            </p>
          </div>

          <div className="border-l-2 border-foreground/20 pl-5 py-1">
            <h3 className="text-sm font-semibold text-foreground">
              Ethical Curation
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              We selectively partner with master perfumers and heritage
              distilleries to bring you authenticated, uncompromised
              formulations.
            </p>
          </div>

          <div className="border-l-2 border-foreground/20 pl-5 py-1">
            <h3 className="text-sm font-semibold text-foreground">
              All-Day Longevity
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Concentrated oils that absorb naturally and release scent
              gradually over hours.
            </p>
          </div>

          <div className="border-l-2 border-foreground/20 pl-5 py-1">
            <h3 className="text-sm font-semibold text-foreground">
              Local Delivery
            </h3>
            <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
              Dispatched directly from Bangladesh with local courier options and
              testing bottles.
            </p>
          </div>
        </div>
      </section>

      <Separator className="mb-20" />

      {/* Beyond Attars Section */}
      <section className="mb-20">
        <div className="grid gap-6 md:grid-cols-[200px_1fr] md:gap-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground pt-1">
            Beyond Fragrance
          </span>
          <div className="text-sm md:text-base leading-relaxed text-muted-foreground font-light max-w-2xl">
            <p>
              Alongside our core collection of attars, we offer curated everyday
              essentials desk pads, cables, and workplace accessories. Just like
              our fragrances, these items are sourced from trusted suppliers to
              bring utility and minimal aesthetic to your daily setup.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial CTA Banner */}
      <section className="rounded-2xl bg-card border border-border p-8 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h3 className="text-2xl font-serif text-foreground font-medium">
            Explore the Fragrance Collection
          </h3>
          <p className="text-sm text-muted-foreground font-light">
            Rose, Oud, Amber, and Musk oil concentrates.
          </p>
        </div>
        <Button asChild size="lg" className="rounded-none px-8 font-medium">
          <Link to="/products">Shop Attars</Link>
        </Button>
      </section>
    </div>
  );
};

export default AboutUs;
