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
    <article className="w-full bg-[#144A72] overflow-hidden">
      {/* =========================================================================
          SECTION 1: SIGNATURE DEEP SLATE-BLUE HEADER BANNER
          (Reference Screenshot 1)
          ========================================================================= */}
      <section className="relative w-full bg-[#144A72] text-white pt-28 sm:pt-36 lg:pt-44 pb-36 sm:pb-48 lg:pb-64 overflow-hidden">
        {/* Topographical Elevation Contour Lines SVG Background */}
        <div
          className="absolute inset-0 pointer-events-none select-none opacity-25"
          aria-hidden="true"
        >
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 1440 600"
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

        {/* Header Grid */}
        <div className="container-standard relative z-10 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left: Giant Display Typography matching brand serif */}
            <div className="lg:col-span-6 xl:col-span-5">
              <h1 className="font-serif font-bold text-[56px] sm:text-[80px] lg:text-[104px] xl:text-[120px] text-[#6BA396] leading-none tracking-tight uppercase select-none">
                ABOUT US
              </h1>
            </div>

            {/* Right: Small Category Tag + Condensed Heading */}
            <div className="lg:col-span-6 xl:col-span-7 lg:pt-3">
              <span className="block text-[#6BA396] text-xs sm:text-[13px] font-sans font-medium tracking-[0.25em] uppercase mb-3">
                ABOUT US
              </span>
              <h2 className="font-serif font-bold text-2xl sm:text-3xl lg:text-[38px] xl:text-[44px] text-white tracking-tight leading-[1.14] uppercase">
                AWARD-WINNING CREATORS OF REMARKABLE TRAVEL EXPERIENCES
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 1B & 2: STAGGERED 2-COLUMN EDITORIAL SHOWCASE
          (Exact reference layout from user screenshot)
          Left: Mountain Ridge Photo (overlapping blue) -> "IT BEGAN WITH A FEELING"
          Right: "WE'RE A TEAM OF PEOPLE IN THE KNOW ABOUT TRAVEL" -> Vestrahorn Peaks Photo
          ========================================================================= */}
      <section className="relative w-full bg-white pt-0 pb-16 sm:pb-24 lg:pb-32">
        <div className="container-standard relative z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
            {/* Left Column: Mountain Photo overlapping + IT BEGAN WITH A FEELING */}
            <div className="lg:col-span-5 xl:col-span-5">
              {/* Mountain Photo overlapping across the Blue & White boundary */}
              <div className="-mt-32 sm:-mt-44 lg:-mt-56 xl:-mt-64">
                <div className="relative w-full max-w-[490px] mx-auto lg:mx-0 aspect-[3/4] bg-[#0E3553] shadow-[0_25px_60px_-15px_rgba(20,74,114,0.35)] overflow-hidden">
                  <Image
                    src="/about/mountain-ridge.jpg"
                    alt="Dramatic mountain ridge rising above the ocean coastline"
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 45vw"
                    className="object-cover object-center"
                  />
                </div>
              </div>

              {/* "IT BEGAN WITH A FEELING" placed directly under the first mountain photo */}
              <div className="mt-14 sm:mt-18 lg:mt-24 max-w-lg">
                <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#111111] leading-[1.12] tracking-tight uppercase mb-4">
                  IT BEGAN WITH A FEELING
                </h2>

                <span className="block text-[11px] sm:text-xs font-sans font-medium tracking-[0.2em] text-[#777777] uppercase mb-6">
                  FLYORA WAS FOUNDED WITH A VISION FOR BESPOKE ADVENTURE
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

            {/* Right Column: WHAT WE'RE ABOUT + Landscape Vestrahorn Peaks Photo */}
            <div className="lg:col-span-7 xl:col-span-7 pt-6 sm:pt-10 lg:pt-14">
              {/* WHAT WE'RE ABOUT Heading & Statement */}
              <span className="block text-xs sm:text-[13px] font-sans font-medium tracking-[0.25em] text-[#111111] uppercase mb-3">
                WHAT WE&apos;RE ABOUT
              </span>

              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[44px] xl:text-[50px] text-[#111111] leading-[1.1] tracking-tight uppercase">
                WE&apos;RE A TEAM OF PEOPLE IN THE KNOW ABOUT TRAVEL
              </h2>

              <p className="mt-6 text-base sm:text-lg lg:text-[18px] text-[#333333] font-sans font-light leading-relaxed max-w-xl">
                And we&apos;re on a mission to create remarkable experiences
                that thoughtfully connect our clients to the world and inspire
                them to explore it with curiosity, humility and a sense of
                wonder.
              </p>

              {/* Vestrahorn Peaks landscape photo placed directly under the text */}
              <div className="mt-12 sm:mt-16 lg:mt-20">
                <div className="relative w-full aspect-[16/10] bg-[#1a1a1a] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
                  <Image
                    src="/about/vestrahorn-peaks.jpg"
                    alt="Dramatic volcanic mountain peaks rising from dark sand beach dunes"
                    fill
                    sizes="(max-width: 1024px) 100vw, 58vw"
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
          (Reference Screenshot 3 - 2 Offset Images on Left, 2 Stories on Right)
          ========================================================================= */}
      <section className="relative w-full bg-white py-12 sm:py-20 lg:py-28">
        <div className="container-standard">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-start">
            {/* Left Column: Two Offset Images */}
            <div className="lg:col-span-5 xl:col-span-5 space-y-12 sm:space-y-16">
              {/* Image 1: Coastal Kayaking Portrait */}
              <div className="relative w-full max-w-[460px] aspect-[3/4] bg-[#0E3553] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
                <Image
                  src="/about/coastal-kayak.jpg"
                  alt="Solo traveler kayaking in vibrant turquoise Mediterranean coastal waters below dramatic cliffs"
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center"
                />
              </div>

              {/* Image 2: Ornate Architecture Puddle Reflection */}
              <div className="relative w-full max-w-[490px] aspect-[4/3] bg-[#222222] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
                <Image
                  src="/about/arch-reflection.jpg"
                  alt="Golden reflection of classical baroque European architecture in a cobblestone street puddle"
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover object-center"
                />
              </div>
            </div>

            {/* Right Column: Two Editorial Story Blocks */}
            <div className="lg:col-span-7 xl:col-span-7 pt-2 sm:pt-4">
              {/* Story Block 1: UNIQUE, DIFFERENT, AND DARING */}
              <div className="mb-20 sm:mb-28 lg:mb-36">
                <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#111111] leading-[1.12] tracking-tight uppercase mb-3">
                  UNIQUE, DIFFERENT, AND DARING
                </h2>

                <span className="block text-[11px] sm:text-xs font-sans font-medium tracking-[0.2em] text-[#777777] uppercase mb-5">
                  AND WE WANT TO MAKE THE REMARKABLE HAPPEN
                </span>

                <div className="space-y-4 text-[14.5px] sm:text-[15.5px] text-[#444444] font-sans font-light leading-relaxed max-w-xl">
                  <p>
                    The journeys we make, make us. We learnt this from legendary
                    travel writer Bruce Chatwin, speaking about the importance
                    of living a &apos;restless&apos; life. When we plan trips
                    for our clients, we want to strip away the barriers that can
                    get between them and the world. They – you – are searching
                    for the unexpected, the unfamiliar, the unknown.
                    Restlessness helps.
                  </p>
                  <p>
                    But so does expertise. Over the years, we&apos;ve assembled
                    a team of travel fanatics – people who live and breathe the
                    world and everything in it. They&apos;re starry-eyed
                    wanderers with the organisational nous of precision
                    engineers. These are the people who&apos;ll help you find
                    your way. Even if that means getting &apos;lost&apos;.
                  </p>
                </div>
              </div>

              {/* Story Block 2: WE'LL SHOW YOU THE WORLD */}
              <div>
                <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#111111] leading-[1.12] tracking-tight uppercase mb-3">
                  WE&apos;LL SHOW YOU THE WORLD
                </h2>

                <span className="block text-[11px] sm:text-xs font-sans font-medium tracking-[0.2em] text-[#777777] uppercase mb-5">
                  AND IN AN ENTIRELY NEW LIGHT
                </span>

                <div className="space-y-4 text-[14.5px] sm:text-[15.5px] text-[#444444] font-sans font-light leading-relaxed max-w-xl">
                  <p>
                    We curate trips for travellers who want to see the world up
                    close — foregoing &apos;tick lists&apos; and tourist traps
                    in favour of deeper and more intimate connections with the
                    world and its cultures.
                  </p>
                  <p>
                    Today, we take people to all seven continents, designing all
                    of our trips from the ground up. This way, no two journeys
                    are ever quite alike. Trekking with the tribes of Borneo;
                    learning the trade of tanning in Morocco; joining the
                    jostling crowds of Sienna&apos;s palio. It&apos;s a wide,
                    wild world. And your travels should be the same.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: "REGENERATIVE TRAVEL" + DESERT EXPLORER & CORAL INSET
          (Reference Screenshot 4)
          ========================================================================= */}
      <section className="relative w-full bg-white py-12 sm:py-20 lg:py-28">
        <div className="container-standard">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 xl:gap-20 items-center">
            {/* Left Column: Regenerative Travel Text & FIND OUT MORE Button */}
            <div className="lg:col-span-5 xl:col-span-5">
              <h2 className="font-serif font-bold text-3xl sm:text-4xl lg:text-[42px] text-[#111111] leading-[1.12] tracking-tight uppercase mb-3">
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
              <div className="relative w-full max-w-[620px] ml-auto">
                {/* Main Landscape Photo: Conservationist in Desert Canyon */}
                <div className="relative w-full aspect-[16/10] sm:aspect-[16/10] bg-[#1a1a1a] overflow-hidden shadow-[0_15px_40px_-10px_rgba(0,0,0,0.12)]">
                  <Image
                    src="/about/regenerative-field.jpg"
                    alt="Female conservationist traveler holding an archaeological specimen in sunny canyon landscape"
                    fill
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className="object-cover object-center"
                  />
                </div>

                {/* Overlapping Bottom-Right Inset: Underwater Coral Reef */}
                <div className="absolute -bottom-8 -right-4 sm:-bottom-10 sm:-right-8 lg:-bottom-12 lg:-right-8 w-44 h-44 sm:w-56 sm:h-56 lg:w-64 lg:h-64 aspect-square bg-[#082032] border-4 border-white shadow-[0_20px_45px_-10px_rgba(0,0,0,0.35)] overflow-hidden z-10">
                  <Image
                    src="/about/coral-reef.jpg"
                    alt="Vibrant tropical branching coral reef in crystal-clear turquoise ocean water"
                    fill
                    sizes="(max-width: 640px) 176px, 256px"
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
