"use client";

export function JourneyCTA({ onStart }: { onStart: () => void }) {
  return (
    <section
      id="cta"
      className="py-14 sm:py-20 lg:py-24 bg-[#463D34] text-white text-center px-4 sm:px-5 scroll-mt-20 sm:scroll-mt-24"
      aria-labelledby="journey-cta-title"
    >
      <div className="max-w-3xl mx-auto">
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-white/70 block mb-2 sm:mb-3">
          YOUR NEXT GETAWAY STARTS HERE
        </span>
        <h2
          id="journey-cta-title"
          className="font-serif text-2xl sm:text-3xl md:text-5xl font-normal mb-3 sm:mb-5 tracking-tight leading-[1.12]"
        >
          Find the perfect travel advisor for your next trip
        </h2>
        <p className="text-xs sm:text-sm md:text-base text-white/80 max-w-xl mx-auto mb-6 sm:mb-8 font-light leading-relaxed">
          Connect with a handpicked specialist, unlock complimentary hotel
          perks, and travel with total peace of mind.
        </p>
        <button
          onClick={onStart}
          className="px-7 sm:px-9 py-3 sm:py-4 rounded-sm bg-white hover:bg-[#FAF7F2] text-[#463D34] text-xs font-semibold uppercase tracking-[0.14em] shadow-lg hover:shadow-xl transition motion-reduce:transition-none motion-reduce:transform-none active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          GET MATCHED
        </button>
      </div>
    </section>
  );
}
