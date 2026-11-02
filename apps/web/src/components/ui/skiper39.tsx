"use client";

import { gsap } from "gsap";
import React, { useEffect, useRef } from "react";

export interface CrowdCanvasProps {
  src?: string;
  rows?: number;
  cols?: number;
  className?: string;
  maxCrowd?: number;
}

export const CrowdCanvas: React.FC<CrowdCanvasProps> = ({
  src = "/crowd/peeps.png",
  rows = 15,
  cols = 7,
  className = "absolute bottom-0 h-full w-full",
  maxCrowd,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let isDestroyed = false;

    const config = {
      src,
      rows,
      cols,
    };

    // UTILS
    const randomRange = (min: number, max: number) =>
      min + Math.random() * (max - min);
    const randomIndex = (array: any[]) => randomRange(0, array.length) | 0;
    const removeFromArray = (array: any[], i: number) => array.splice(i, 1)[0];
    const removeItemFromArray = (array: any[], item: any) =>
      removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = (array: any[]) =>
      removeFromArray(array, randomIndex(array));
    const getRandomFromArray = (array: any[]) => array[randomIndex(array) | 0];

    const stage = {
      width: 0,
      height: 0,
      scale: 1,
    };

    // TYPES
    type Peep = {
      image: HTMLImageElement;
      rect: number[];
      width: number;
      height: number;
      rawWidth: number;
      rawHeight: number;
      x: number;
      y: number;
      anchorY: number;
      scaleX: number;
      walk: gsap.core.Timeline | null;
      setRect: (rect: number[]) => void;
      render: (ctx: CanvasRenderingContext2D) => void;
    };

    // TWEEN FACTORIES
    const resetPeep = ({ stage, peep }: { stage: any; peep: Peep }) => {
      const direction = Math.random() > 0.5 ? 1 : -1;

      // Realistic staggered depth: peeps further back walk slightly higher up
      const depth = gsap.parseEase("power2.in")(Math.random());
      const maxOffset = Math.min(stage.height * 0.35, peep.height * 0.45);
      const offsetY = peep.height * 0.1 - maxOffset * depth;
      const startY = stage.height - peep.height + offsetY;

      let startX: number;
      let endX: number;

      if (direction === 1) {
        startX = -peep.width;
        endX = stage.width;
        peep.scaleX = 1;
      } else {
        startX = stage.width + peep.width;
        endX = -peep.width;
        peep.scaleX = -1;
      }

      peep.x = startX;
      peep.y = startY;
      peep.anchorY = startY;

      return {
        startX,
        startY,
        endX,
      };
    };

    const normalWalk = ({ peep, props }: { peep: Peep; props: any }) => {
      const { startY, endX } = props;
      // Duration scales comfortably with screen width
      const baseDistance = Math.abs(endX - peep.x);
      const speed = randomRange(45, 95); // px per second
      const xDuration = Math.max(6, baseDistance / speed);
      const yDuration = 0.22;

      const tl = gsap.timeline();
      tl.timeScale(randomRange(0.7, 1.3));
      tl.to(
        peep,
        {
          duration: xDuration,
          x: endX,
          ease: "none",
        },
        0,
      );
      tl.to(
        peep,
        {
          duration: yDuration,
          repeat: Math.ceil(xDuration / yDuration),
          yoyo: true,
          y: startY - Math.max(3, 7 * stage.scale),
          ease: "power1.inOut",
        },
        0,
      );

      return tl;
    };

    const walks = [normalWalk];

    // FACTORY FUNCTIONS
    const createPeep = ({
      image,
      rect,
    }: {
      image: HTMLImageElement;
      rect: number[];
    }): Peep => {
      const peep: Peep = {
        image,
        rect: [],
        width: 0,
        height: 0,
        rawWidth: 0,
        rawHeight: 0,
        x: 0,
        y: 0,
        anchorY: 0,
        scaleX: 1,
        walk: null,
        setRect: (r: number[]) => {
          peep.rect = r;
          peep.rawWidth = r[2];
          peep.rawHeight = r[3];
          peep.width = r[2] * stage.scale;
          peep.height = r[3] * stage.scale;
        },
        render: (c: CanvasRenderingContext2D) => {
          c.save();
          c.translate(peep.x, peep.y);
          c.scale(peep.scaleX * stage.scale, stage.scale);
          c.drawImage(
            peep.image,
            peep.rect[0],
            peep.rect[1],
            peep.rect[2],
            peep.rect[3],
            0,
            0,
            peep.rawWidth,
            peep.rawHeight,
          );
          c.restore();
        },
      };

      peep.setRect(rect);
      return peep;
    };

    const img = new Image();
    // Allow cross-origin when loaded from external CDN
    img.crossOrigin = "anonymous";

    const allPeeps: Peep[] = [];
    const availablePeeps: Peep[] = [];
    const crowd: Peep[] = [];

    const createPeeps = () => {
      const { rows, cols } = config;
      const { naturalWidth: width, naturalHeight: height } = img;
      const total = rows * cols;
      const rectWidth = width / rows;
      const rectHeight = height / cols;

      for (let i = 0; i < total; i++) {
        allPeeps.push(
          createPeep({
            image: img,
            rect: [
              (i % rows) * rectWidth,
              ((i / rows) | 0) * rectHeight,
              rectWidth,
              rectHeight,
            ],
          }),
        );
      }
    };

    const addPeepToCrowd = () => {
      if (availablePeeps.length === 0) return null;
      const peep = removeRandomFromArray(availablePeeps);
      const walk = getRandomFromArray(walks)({
        peep,
        props: resetPeep({
          peep,
          stage,
        }),
      }).eventCallback("onComplete", () => {
        if (isDestroyed) return;
        removePeepFromCrowd(peep);
        addPeepToCrowd();
      });

      peep.walk = walk;

      crowd.push(peep);
      crowd.sort((a, b) => a.anchorY - b.anchorY);

      return peep;
    };

    const removePeepFromCrowd = (peep: Peep) => {
      removeItemFromArray(crowd, peep);
      availablePeeps.push(peep);
    };

    const initCrowd = () => {
      // Determine crowd size based on width and maxCrowd
      const desiredCount = maxCrowd
        ? Math.min(allPeeps.length, maxCrowd)
        : Math.min(allPeeps.length, Math.max(18, Math.floor(stage.width / 16)));

      for (let i = 0; i < desiredCount; i++) {
        const peep = addPeepToCrowd();
        if (peep && peep.walk) {
          peep.walk.progress(Math.random());
        }
      }
    };

    const render = () => {
      if (!canvas || isDestroyed) return;
      const dpr = window.devicePixelRatio || 1;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(dpr, dpr);

      for (let i = 0; i < crowd.length; i++) {
        crowd[i].render(ctx);
      }

      ctx.restore();
    };

    const resize = () => {
      if (!canvas || isDestroyed) return;
      const clientW =
        canvas.clientWidth || canvas.parentElement?.clientWidth || 300;
      const clientH =
        canvas.clientHeight || canvas.parentElement?.clientHeight || 200;

      if (clientW === 0 || clientH === 0) return;

      stage.width = clientW;
      stage.height = clientH;

      // Proportional scale factor for small or large canvases:
      // In a small footer (e.g. 180px - 220px), characters are ~100-130px tall (roughly 60% of canvas height)
      // Unscaled raw character height is 324px
      const targetPeepH = Math.min(220, Math.max(70, stage.height * 0.62));
      stage.scale = targetPeepH / 324;

      const dpr = window.devicePixelRatio || 1;
      canvas.width = stage.width * dpr;
      canvas.height = stage.height * dpr;

      // Update peep sizes
      allPeeps.forEach((peep) => {
        peep.width = peep.rawWidth * stage.scale;
        peep.height = peep.rawHeight * stage.scale;
      });

      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });

      crowd.length = 0;
      availablePeeps.length = 0;
      availablePeeps.push(...allPeeps);

      initCrowd();
    };

    let isInitialized = false;
    const init = () => {
      if (isInitialized || isDestroyed) return;
      isInitialized = true;
      createPeeps();
      resize();
      gsap.ticker.add(render);
    };

    img.onload = () => {
      if (!isDestroyed) init();
    };

    // If local image fails, fall back to remote CDN URL
    img.onerror = () => {
      if (
        img.src !==
        "https://cdn.21st.dev/assets/localized/abdb8990a7bef8c2f5af3e45f0a3c969c4b0603fba8be92e81347de4ea4e1ed7.png"
      ) {
        img.src =
          "https://cdn.21st.dev/assets/localized/abdb8990a7bef8c2f5af3e45f0a3c969c4b0603fba8be92e81347de4ea4e1ed7.png";
      }
    };

    img.src = config.src;
    if (img.complete && img.naturalWidth > 0) {
      init();
    }

    const handleResize = () => resize();
    window.addEventListener("resize", handleResize);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            resize();
          })
        : null;

    if (canvas.parentElement && resizeObserver) {
      resizeObserver.observe(canvas.parentElement);
    }

    return () => {
      isDestroyed = true;
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) resizeObserver.disconnect();
      gsap.ticker.remove(render);
      crowd.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });
      allPeeps.forEach((peep) => {
        if (peep.walk) peep.walk.kill();
      });
    };
  }, [src, rows, cols, maxCrowd]);

  return <canvas ref={canvasRef} className={className} />;
};

export interface Skiper39Props {
  label?: string;
  showLabel?: boolean;
  className?: string;
  canvasClassName?: string;
  src?: string;
  rows?: number;
  cols?: number;
  maxCrowd?: number;
}

export const Skiper39: React.FC<Skiper39Props> = ({
  label = "CROUD\nCANVAS",
  showLabel = true,
  className = "relative h-48 sm:h-56 md:h-64 w-full bg-white text-black overflow-hidden",
  canvasClassName = "absolute bottom-0 h-full w-full",
  src = "/crowd/peeps.png",
  rows = 15,
  cols = 7,
  maxCrowd,
}) => {
  return (
    <div className={className}>
      {showLabel && (
        <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-center pointer-events-none select-none z-10">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.22em] text-[#7A7167] opacity-80 leading-tight whitespace-pre-line text-center">
            {label}
          </span>
          <div className="w-px h-6 sm:h-10 bg-gradient-to-b from-[#7A7167]/30 to-black/20" />
        </div>
      )}
      <div className="absolute inset-0 w-full h-full">
        <CrowdCanvas
          src={src}
          rows={rows}
          cols={cols}
          className={canvasClassName}
          maxCrowd={maxCrowd}
        />
      </div>
    </div>
  );
};

export default Skiper39;
