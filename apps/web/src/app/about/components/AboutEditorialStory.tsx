"use client";

import React from "react";
import Image from "next/image";

interface AboutEditorialStoryProps {
  onOpenEnquiry?: (serviceId?: string) => void;
}

export const AboutEditorialStory: React.FC<AboutEditorialStoryProps> = ({
  onOpenEnquiry,
}) => {
  return (
    <article className="w-full bg-white overflow-hidden">
      {/* =========================================================================
          SECTION 1: SIGNATURE DEEP SLATE-BLUE HERO BANNER
          (Reference Screenshot 1)
          - Left: "ABOUT US" in mint green + Mountain Image (tall portrait, hanging down into Section 2)
          - Right: "ABOUT US" label + "AWARD-WINNING CREATORS OF REMARKABLE TRAVEL EXPERIENCES"
          ========================================================================= */}
      <section className="relative w-full bg-[#144A72] text-white overflow-visible z-10 pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 xl:h-[741px] xl:pt-[280px] xl:pb-0">
        {/* Topographical Elevation Contour Lines SVG Background */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-25"
          aria-hidden="true"
        >
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 1440 700"
            fill="none"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M-50 120C280 60 550 220 920 140C1220 70 1420 180 1550 120"
              stroke="#5BC3A6"
              strokeWidth="1.5"
              strokeDasharray="6 4"
            />
            <path
              d="M-50 180C300 110 580 270 960 190C1260 120 1450 230 1550 170"
              stroke="#5BC3A6"
              strokeWidth="1.5"
            />
            <path
              d="M-50 240C320 160 610 320 1000 240C1300 170 1480 280 1550 220"
              stroke="white"
              strokeWidth="1.2"
              strokeOpacity="0.4"
            />
            <path
              d="M-50 300C340 210 640 370 1040 290C1340 220 1510 330 1550 270"
              stroke="white"
              strokeWidth="1.2"
              strokeOpacity="0.3"
            />
            <path
              d="M-50 360C360 260 670 420 1080 340C1380 270 1530 380 1550 320"
              stroke="#5BC3A6"
              strokeWidth="1.5"
              strokeOpacity="0.5"
            />
            <path
              d="M-50 420C380 310 700 470 1120 390C1420 320 1550 430 1550 370"
              stroke="white"
              strokeWidth="1.2"
              strokeOpacity="0.25"
            />
            <path
              d="M-50 480C400 360 730 520 1160 440C1460 370 1570 480 1550 420"
              stroke="#5BC3A6"
              strokeWidth="1.5"
              strokeOpacity="0.4"
            />
          </svg>
        </div>

        {/* Ambient Radial Gradient Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-b from-[#0F3958]/50 via-transparent to-[#0A263B]/60 pointer-events-none"
          aria-hidden="true"
        />

        <div className="container-standard relative z-10 xl:max-w-[1504px] xl:px-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:grid-cols-[585px_minmax(0,1fr)] xl:gap-[154px] items-end xl:items-start">
            {/* Left Column (5 Cols): ABOUT US + Mountain Image (Image 1) */}
            <div className="lg:col-span-5 xl:col-auto">
              <h1 className="font-heading font-bold text-5xl sm:text-6xl lg:text-[76px] xl:text-[98px] text-[#5BC3A6] leading-none tracking-tight uppercase mb-6 sm:mb-8 xl:mb-[117px] select-none">
                ABOUT US
              </h1>

              {/* Mountain Image: Tall Portrait aspect-[3/4], hanging down across Section 1 into Section 2 */}
              <div className="relative w-full max-w-[460px] xl:max-w-[585px] aspect-[3/4] bg-[#0E3553] shadow-[0_25px_60px_-15px_rgba(20,74,114,0.35)] z-20 overflow-hidden -mb-40 sm:-mb-52 lg:-mb-64 xl:mb-0">
                <Image
                  src="/about/mountain-ridge.jpg"
                  alt="Dramatic mountain ridge rising above the ocean coastline"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Right Column (7 Cols): Blue Banner text (Aligned inside the blue banner) */}
            <div className="lg:col-span-7 xl:col-auto lg:pl-4 xl:pl-0 pb-4 sm:pb-6 lg:pb-8 xl:pt-[216px] xl:pb-0">
              <span className="block text-[#5BC3A6] text-xs sm:text-[13px] font-sans font-medium tracking-[0.25em] uppercase mb-3">
                ABOUT US
              </span>
              <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-[32px] xl:text-[38px] text-white tracking-tight leading-[1.18] uppercase max-w-lg">
                AWARD-WINNING CREATORS OF REMARKABLE TRAVEL EXPERIENCES
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: WHITE EDITORIAL FLOW & OVERLAPPING TWO-IMAGE COLLAGE
          (Reference Screenshots 1 & 2)
          - Left: Clearance for hanging Mountain Image + "IT BEGAN WITH A FEELING"
          - Right: "WHAT WE'RE ABOUT" + "WE'RE A TEAM OF PEOPLE..." + mission statement,
                   followed by Image 2 (Vestrahorn Mountain) overlapping the Mountain Image
          ========================================================================= */}
      <section className="relative w-full bg-white z-0 pt-10 sm:pt-14 lg:pt-16 xl:pt-[100px] pb-16 sm:pb-24 lg:pb-32">
        <div className="container-standard xl:max-w-[1504px] xl:px-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:grid-cols-[585px_minmax(0,1fr)] xl:gap-[154px] items-start">
            {/* Left Column (5 Cols): Clearance for hanging Mountain Image + IT BEGAN WITH A FEELING */}
            <div className="lg:col-span-5 xl:col-auto pt-44 sm:pt-56 lg:pt-68 xl:pt-[530px]">
              <div className="max-w-md">
                <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[40px] text-[#111111] leading-[1.12] tracking-tight uppercase mb-4">
                  IT BEGAN WITH A FEELING
                </h2>

                <span className="block text-[11px] sm:text-xs font-sans font-medium tracking-[0.2em] text-[#777777] uppercase mb-6">
                  FLYORA WAS FOUNDED IN 2005 BY TOM, JAMES AND MATT
                </span>

                <div className="space-y-4 text-[14.5px] sm:text-[15.5px] text-[#444444] font-sans font-light leading-relaxed">
                  <p>
                    A trio of friends who wanted to sweep aside the prevailing
                    current of &apos;package&apos; trips and same-same
                    vacations.
                  </p>
                  <p>
                    Since then, we&apos;ve become award-winning curators of
                    tailor-made travel experiences — all crafted with
                    inspirational engineering and an incomparable attention to
                    detail. For us, the most important thing has always been:
                    how do you want to feel? The rest is in the detail.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column (7 Cols): WHAT WE'RE ABOUT + Image 2 (Vestrahorn peaks) */}
            <div className="lg:col-span-7 xl:col-auto lg:pl-4 xl:pl-0">
              {/* WHAT WE'RE ABOUT & WE'RE A TEAM... */}
              <div className="max-w-xl">
                <span className="block text-xs sm:text-[13px] font-sans font-medium tracking-[0.25em] text-[#111111] uppercase mb-3">
                  WHAT WE&apos;RE ABOUT
                </span>

                <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[42px] xl:text-[48px] text-[#111111] leading-[1.1] tracking-tight uppercase">
                  WE&apos;RE A TEAM OF PEOPLE IN THE KNOW ABOUT TRAVEL
                </h2>

                <p className="mt-6 text-base sm:text-lg lg:text-[18px] text-[#333333] font-sans font-light leading-relaxed">
                  And we&apos;re on a mission to create remarkable experiences
                  that thoughtfully connect our clients to the world and inspire
                  them to explore it with curiosity, humility and a sense of
                  wonder.
                </p>
              </div>

              {/* Image 2 (Vestrahorn peaks): Large landscape photo overlapping bottom-right of Mountain Image */}
              <div className="mt-12 sm:mt-16 lg:mt-20 relative z-20 xl:mt-[60px]">
                <div className="relative w-full lg:-ml-12 xl:-ml-[247px] lg:w-[calc(100%+3rem)] xl:w-[957px] aspect-[16/10] xl:aspect-[957/649] bg-[#1a1a1a] overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)]">
                  <Image
                    src="/about/vestrahorn-peaks.jpg"
                    alt="Dramatic volcanic mountain peaks rising from dark sand beach dunes"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          REGENERATIVE TRAVEL: copy at left, field image at right, coral inset
          hanging from its lower-right edge.
          ========================================================================= */}
      <section className="relative w-full bg-white py-14 sm:py-20 lg:pt-24 lg:pb-36 xl:pt-[132px] xl:pb-[225px] overflow-hidden">
        <div className="container-standard xl:max-w-[1220px] xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:grid-cols-[400px_minmax(0,1fr)] xl:gap-[93px] items-center xl:items-start">
            {/* Left Column: Regenerative Travel Text & FIND OUT MORE Button */}
            <div className="lg:col-span-5 xl:col-auto xl:pt-[137px]">
              <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#111111] leading-[1.12] tracking-tight uppercase mb-3">
                REGENERATIVE TRAVEL
              </h2>

              <span className="block text-[11px] sm:text-xs font-sans font-medium tracking-[0.2em] text-[#777777] uppercase mb-5">
                A LASTING IMPACT FOR A CHANGING WORLD
              </span>

              <p className="text-[14.5px] sm:text-[15.5px] text-[#444444] font-sans font-light leading-relaxed mb-8 max-w-md">
                At Flyora, we know you&apos;re seeking travel experiences that
                will leave a lasting, positive impact on our planet and the
                communities that call it home. This is a belief we also share,
                and it has been since our founding.
              </p>

              {/* Exact Solid Black Button from Reference */}
              <button
                type="button"
                onClick={() =>
                  onOpenEnquiry
                    ? onOpenEnquiry("Regenerative Travel Inquiry")
                    : undefined
                }
                className="inline-flex items-center justify-center px-8 py-3.5 bg-black hover:bg-zinc-800 active:bg-zinc-900 text-white text-xs font-sans font-semibold uppercase tracking-[0.2em] transition-colors rounded-none cursor-pointer shadow-xs"
              >
                FIND OUT MORE
              </button>
            </div>

            {/* Right Column: Large Field Photograph with Overlapping Coral Reef Inset */}
            <div className="lg:col-span-7 xl:col-auto">
              <div className="relative w-full max-w-[640px] xl:max-w-none xl:w-[834px] ml-auto xl:ml-0">
                {/* Main Landscape Photo: Conservationist in Desert Canyon */}
                <div className="relative w-full aspect-[16/11] xl:aspect-[834/570] bg-[#1a1a1a] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
                  <Image
                    src="/about/regenerative-field.jpg"
                    alt="Female conservationist traveler holding an archaeological specimen in sunny canyon landscape"
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* Overlapping Coral Reef Inset (Matching exact reference: borderless, inset from right edge, hanging over bottom edge) */}
                <div className="absolute -bottom-10 sm:-bottom-14 lg:-bottom-16 right-8 sm:right-12 lg:right-16 xl:-bottom-[97px] xl:right-[55px] w-[42%] max-w-[260px] xl:w-[264px] xl:max-w-none aspect-[4/5] xl:aspect-[264/250] bg-[#082032] overflow-hidden z-10 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)]">
                  <Image
                    src="/about/coral-reef.jpg"
                    alt="Vibrant tropical branching coral reef in crystal-clear turquoise ocean water"
                    fill
                    sizes="(max-width: 640px) 180px, 260px"
                    className="object-cover object-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
};
