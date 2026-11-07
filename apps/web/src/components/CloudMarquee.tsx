import React from "react";
import Image from "next/image";

const CLOUD_FRAMES = [
  { src: "/cloude-frame/Frame@1.5x-1.png", key: "c1", w: 1580, h: 440 },
  { src: "/cloude-frame/Frame@1.5x-2.png", key: "c2", w: 1580, h: 440 },
  { src: "/cloude-frame/Frame@1.5x-3.png", key: "c3", w: 1580, h: 440 },
  { src: "/cloude-frame/Frame@1.5x-4.png", key: "c4", w: 1580, h: 440 },
];

const CLOUDS = [...CLOUD_FRAMES, ...CLOUD_FRAMES];

export interface CloudMarqueeProps {
  className?: string;
  fadeColor?: string;
}

export function CloudMarquee({
  className = "",
  fadeColor = "var(--background, #ffffff)",
}: CloudMarqueeProps) {
  return (
    <div
      className={`relative z-10 -mt-6 sm:-mt-10 lg:-mt-16 -mb-4 sm:-mb-8 lg:-mb-10 overflow-hidden ${className}`.trim()}
      aria-hidden="true"
      data-navbar-solid-from=""
      style={{ pointerEvents: "none" }}
    >
      <div
        className="relative"
        style={{ overflow: "hidden", fontSize: 0, lineHeight: 0 }}
      >
        <div
          className="animate-marquee will-change-transform"
          style={{ display: "flex", width: "max-content" }}
        >
          {CLOUDS.map((cloud, idx) => (
            <Image
              key={`${cloud.key}-${idx}`}
              src={cloud.src}
              alt=""
              width={cloud.w}
              height={cloud.h}
              sizes="(max-width: 640px) 520px, (max-width: 1024px) 960px, 1580px"
              style={{
                display: "block",
                flexShrink: 0,
                width: "clamp(460px, 80vw, 1580px)",
                height: "auto",
                margin: 0,
                marginRight: "-12%",
                padding: 0,
                border: "none",
              }}
              priority={idx < 4}
            />
          ))}
        </div>
        <div
          className="absolute inset-x-0 bottom-0 h-2/3"
          style={{
            background: `linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.15) 18%, rgba(255,255,255,0.4) 38%, rgba(255,255,255,0.72) 55%, rgba(255,255,255,0.92) 68%, ${fadeColor} 78%, ${fadeColor} 100%)`,
          }}
        />
      </div>
    </div>
  );
}

export default CloudMarquee;
