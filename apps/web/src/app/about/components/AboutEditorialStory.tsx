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
          SECTION 1 & 2: 75vh SIGNATURE BLUE HERO + OVERLAPPING TWO-IMAGE EDITORIAL COLLAGE
          (Exact reference layout from user screenshots 1 & 2)
          ========================================================================= */}
      <section className="relative w-full bg-white overflow-hidden">
        {/* 75vh Signature Deep Slate-Blue Background Banner */}
        <div className="absolute top-0 left-0 right-0 h-[80vh] min-h-[580px] bg-[#144A72] overflow-hidden z-0 pointer-events-none">
          {/* Topographical Elevation Contour Lines SVG Background */}
          <div
            className="absolute inset-0 select-none opacity-25"
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
        </div>

        {/* Content Container */}
        <div className="container-standard relative z-10 pt-28 sm:pt-36 lg:pt-40 pb-16 sm:pb-24 lg:pb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
            {/* Left Column (5 Cols): ABOUT US + Image 1 (Mountain Ridge) + IT BEGAN WITH A FEELING */}
            <div className="lg:col-span-5 xl:col-span-5">
              {/* ABOUT US Title in Mint Green */}
              <h1 className="font-heading font-bold text-5xl sm:text-6xl lg:text-[76px] xl:text-[88px] text-[#5BC3A6] leading-none tracking-tight uppercase mb-6 sm:mb-8 select-none">
                ABOUT US
              </h1>

              {/* Mountain Image (Image 1): Tall Portrait aspect-[3/4], crossing the 75vh blue banner into the white section */}
              <div className="relative w-full max-w-[460px] aspect-[3/4] bg-[#0E3553] shadow-[0_25px_60px_-15px_rgba(20,74,114,0.35)] z-10 overflow-hidden">
                <Image
                  src="/about/mountain-ridge.jpg"
                  alt="Dramatic mountain ridge rising above the ocean coastline"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
              </div>

              {/* "IT BEGAN WITH A FEELING" (placed directly under Mountain Image on the white section, side-by-side with Image 2) */}
              <div className="mt-14 sm:mt-20 lg:mt-24 max-w-md">
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

            {/* Right Column (7 Cols): Blue Banner text + White Section text + Image 2 (Vestrahorn peaks with left overlay) */}
            <div className="lg:col-span-7 xl:col-span-7 lg:pl-4 xl:pl-8 flex flex-col">
              {/* Blue Banner Right Text (Sitting inside the 75vh blue banner) */}
              <div className="pt-8 sm:pt-14 lg:pt-28 xl:pt-32 pb-16 sm:pb-24 lg:pb-36 max-w-lg">
                <span className="block text-[#5BC3A6] text-xs sm:text-[13px] font-sans font-medium tracking-[0.25em] uppercase mb-3">
                  ABOUT US
                </span>
                <h2 className="font-heading font-bold text-2xl sm:text-3xl lg:text-[32px] xl:text-[38px] text-white tracking-tight leading-[1.18] uppercase">
                  AWARD-WINNING CREATORS OF REMARKABLE TRAVEL EXPERIENCES
                </h2>
              </div>

              {/* White Section Right Text (Directly opposite the lower half of Image 1) */}
              <div className="pt-4 sm:pt-8 lg:pt-12 max-w-xl">
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

              {/* Image 2 (Vestrahorn peaks landscape): Large photo with left margin offset overlapping bottom-right of Image 1 */}
              <div className="mt-12 sm:mt-16 lg:mt-20 relative z-20">
                <div className="relative w-full lg:-ml-12 xl:-ml-20 lg:w-[calc(100%+3rem)] xl:w-[calc(100%+5rem)] aspect-[16/10] bg-[#1a1a1a] overflow-hidden shadow-[0_20px_50px_-10px_rgba(0,0,0,0.18)]">
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
          SECTION 3: "UNIQUE, DIFFERENT, AND DARING" & "WE'LL SHOW YOU THE WORLD"
          (Reference Screenshot 3 - Exact Pair Positioning)
          Pair 1: Coastal Kayak (Shifted Right) <-> "UNIQUE, DIFFERENT, AND DARING"
          Pair 2: Architecture Puddle Reflection (Bleeding Left) <-> "WE'LL SHOW YOU THE WORLD"
          ========================================================================= */}
      <section className="relative w-full bg-white py-14 sm:py-20 lg:py-28 overflow-hidden">
        <div className="container-standard">
          {/* Pair 1: Kayak Photo (Right-aligned in left col) + UNIQUE, DIFFERENT, AND DARING */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
            {/* Left: Image 3 (Coastal Kayak) indented to the right */}
            <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[390px] xl:max-w-[420px] aspect-[3/4] bg-[#0E3553] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
                <Image
                  src="/about/coastal-kayak.jpg"
                  alt="Solo traveler kayaking in vibrant turquoise Mediterranean coastal waters below dramatic cliffs"
                  fill
                  sizes="(max-width: 1024px) 100vw, 35vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Right: Story Block 1 - UNIQUE, DIFFERENT, AND DARING */}
            <div className="lg:col-span-7 xl:col-span-7 pt-2 sm:pt-4">
              <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#111111] leading-[1.12] tracking-tight uppercase mb-3">
                UNIQUE, DIFFERENT, AND DARING
              </h2>

              <span className="block text-[11px] sm:text-xs font-sans font-medium tracking-[0.2em] text-[#777777] uppercase mb-5">
                AND WE WANT TO MAKE THE REMARKABLE HAPPEN
              </span>

              <div className="space-y-4 text-[14.5px] sm:text-[15.5px] text-[#444444] font-sans font-light leading-relaxed max-w-xl">
                <p>
                  The journeys we make, make us. We learnt this from legendary
                  travel writer Bruce Chatwin, speaking about the importance of
                  living a &apos;restless&apos; life. When we plan trips for our
                  clients, we want to strip away the barriers that can get
                  between them and the world. They – you – are searching for the
                  unexpected, the unfamiliar, the unknown. Restlessness helps.
                </p>
                <p>
                  But so does expertise. Over the years, we&apos;ve assembled a
                  team of travel fanatics – people who live and breathe the
                  world and everything in it. They&apos;re starry-eyed wanderers
                  with the organisational nous of precision engineers. These are
                  the people who&apos;ll help you find your way. Even if that
                  means getting &apos;lost&apos;.
                </p>
              </div>
            </div>
          </div>

          {/* Pair 2: Architecture Reflection (Shifted Left) + WE'LL SHOW YOU THE WORLD */}
          <div className="mt-14 sm:mt-20 lg:mt-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
            {/* Left: Image 4 (Architecture Puddle Reflection) pulled out to the left */}
            <div className="lg:col-span-6 xl:col-span-6">
              <div className="relative w-full max-w-[540px] xl:max-w-[580px] lg:-ml-6 xl:-ml-12 aspect-[16/10] sm:aspect-[4/3] bg-[#222222] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
                <Image
                  src="/about/arch-reflection.jpg"
                  alt="Golden reflection of classical baroque European architecture in a cobblestone street puddle"
                  fill
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Right: Story Block 2 - WE'LL SHOW YOU THE WORLD */}
            <div className="lg:col-span-6 xl:col-span-6 pt-2 sm:pt-4">
              <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#111111] leading-[1.12] tracking-tight uppercase mb-3">
                WE&apos;LL SHOW YOU THE WORLD
              </h2>

              <span className="block text-[11px] sm:text-xs font-sans font-medium tracking-[0.2em] text-[#777777] uppercase mb-5">
                AND IN AN ENTIRELY NEW LIGHT
              </span>

              <div className="space-y-4 text-[14.5px] sm:text-[15.5px] text-[#444444] font-sans font-light leading-relaxed max-w-xl">
                <p>
                  We curate trips for travellers who want to see the world up
                  close — foregoing &apos;tick lists&apos; and tourist traps in
                  favour of deeper and more intimate connections with the world
                  and its cultures.
                </p>
                <p>
                  Today, we take people to all seven continents, designing all
                  of our trips from the ground up. This way, no two journeys are
                  ever quite alike. Trekking with the tribes of Borneo; learning
                  the trade of tanning in Morocco; joining the jostling crowds
                  of Sienna&apos;s palio. It&apos;s a wide, wild world. And your
                  travels should be the same.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: "REGENERATIVE TRAVEL" + DESERT EXPLORER & CORAL INSET
          (Reference Screenshot 4 - Exact image sizing and placing)
          ========================================================================= */}
      <section className="relative w-full bg-white py-14 sm:py-20 lg:pt-24 lg:pb-36 overflow-hidden">
        <div className="container-standard">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
            {/* Left Column: Regenerative Travel Text & FIND OUT MORE Button */}
            <div className="lg:col-span-5 xl:col-span-5">
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
            <div className="lg:col-span-7 xl:col-span-7">
              <div className="relative w-full max-w-[640px] xl:max-w-[680px] ml-auto">
                {/* Main Landscape Photo: Conservationist in Desert Canyon */}
                <div className="relative w-full aspect-[16/11] bg-[#1a1a1a] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
                  <Image
                    src="/about/regenerative-field.jpg"
                    alt="Female conservationist traveler holding an archaeological specimen in sunny canyon landscape"
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* Overlapping Coral Reef Inset (Matching exact reference: borderless, inset from right edge, hanging over bottom edge) */}
                <div className="absolute -bottom-10 sm:-bottom-14 lg:-bottom-16 right-8 sm:right-12 lg:right-16 xl:right-20 w-[42%] max-w-[260px] aspect-[4/5] bg-[#082032] overflow-hidden z-10 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.3)]">
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
