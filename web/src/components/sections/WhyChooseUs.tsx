import { whyChooseUs } from "@/config/site";
import { Reveal } from "@/components/motion/Reveal";

export function WhyChooseUs() {
  return (
    <section className="bg-surface py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <Reveal>
          <h2 className="font-display text-3xl tracking-wide text-ink sm:text-4xl">
            Why choose us
          </h2>
          <p className="mt-3 max-w-2xl text-muted">
            From sourcing to cold storage, every step is built for wholesale
            reliability.
          </p>
        </Reveal>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {whyChooseUs.map((item, index) => (
            <Reveal key={item.title} delay={index * 0.06}>
              <p className="font-display text-sm tracking-[0.2em] text-brand">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="mt-2 font-display text-xl tracking-wide text-ink">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
