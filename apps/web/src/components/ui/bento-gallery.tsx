"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import { cn } from "@/lib/utils"; // Assumes a 'lib/utils.ts' file for 'cn'
import { X } from "lucide-react";

// Defines the structure for each image item in the gallery
export type ImageItem = {
  id: number | string;
  title: string;
  desc: string;
  url: string;
  span: string; // Tailwind CSS grid span classes (e.g., "md:col-span-2")
  serviceId?: string;
};

// Defines the props for the main gallery component
export interface InteractiveImageBentoGalleryProps {
  imageItems: ImageItem[];
  title: string;
  description: string;
  className?: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

// Animation variants for the container to stagger children
const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Animation variants for each gallery item
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 },
  },
};

// Modal component for displaying the selected image
const ImageModal = ({
  item,
  onClose,
}: {
  item: ImageItem;
  onClose: () => void;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="relative w-full max-w-4xl p-3 sm:p-5 bg-[#1C1815]/95 rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={item.url}
          alt={item.title}
          className="h-auto max-h-[75vh] w-full rounded-xl object-contain mx-auto"
        />
        <div className="mt-4 px-2 text-left">
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-white tracking-wide">
            {item.title}
          </h3>
          <p className="mt-1 text-sm sm:text-base text-stone-300 font-sans leading-relaxed">
            {item.desc}
          </p>
        </div>
      </motion.div>
      <button
        onClick={onClose}
        className="absolute right-5 top-5 text-white/80 transition-colors hover:text-white p-2 rounded-full bg-black/50 hover:bg-black/70 cursor-pointer"
        aria-label="Close image view"
      >
        <X size={24} />
      </button>
    </motion.div>
  );
};

// Main gallery component
const InteractiveImageBentoGallery: React.FC<
  InteractiveImageBentoGalleryProps
> = ({
  imageItems,
  title,
  description,
  className,
  actionLabel,
  onActionClick,
}) => {
  const [selectedItem, setSelectedItem] = useState<ImageItem | null>(null);
  const [dragConstraint, setDragConstraint] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  // Calculate the draggable area constraint
  useEffect(() => {
    const calculateConstraints = () => {
      if (gridRef.current && containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const gridWidth = gridRef.current.scrollWidth;
        // The '- 32' provides some padding at the end
        const newConstraint = Math.min(0, containerWidth - gridWidth - 32);
        setDragConstraint(newConstraint);
      }
    };

    calculateConstraints();
    window.addEventListener("resize", calculateConstraints);
    return () => window.removeEventListener("resize", calculateConstraints);
  }, [imageItems]);

  // Framer Motion scroll animations
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.2], [30, 0]);

  return (
    <section
      ref={targetRef}
      className={cn(
        "relative w-full overflow-hidden bg-[#FDFCFB] py-16 sm:py-20",
        className,
      )}
    >
      <motion.div
        style={{ opacity, y }}
        className="w-full px-6 sm:px-10 lg:px-[105px] text-center"
      >
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold tracking-tight text-[#1C1815]">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm sm:text-base text-stone-600 font-sans leading-relaxed">
          {description}
        </p>
      </motion.div>

      <div
        ref={containerRef}
        className="relative mt-10 sm:mt-12 w-full cursor-grab active:cursor-grabbing select-none"
      >
        <motion.div
          className="w-max"
          drag="x"
          dragConstraints={{ left: dragConstraint, right: 0 }}
          dragElastic={0.05}
        >
          <motion.div
            ref={gridRef}
            className="grid grid-rows-2 h-[420px] sm:h-[480px] lg:h-[520px] auto-cols-[minmax(16rem,1fr)] sm:auto-cols-[minmax(20rem,1fr)] lg:auto-cols-[minmax(24rem,1fr)] grid-flow-col gap-4 sm:gap-5 px-6 sm:px-10 lg:px-[105px]"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {imageItems.map((item) => (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className={cn(
                  "group relative flex h-full min-h-[12rem] w-full min-w-[15rem] cursor-pointer items-end overflow-hidden rounded-[14px] border border-black/[0.08] bg-card p-4 shadow-xs transition-shadow duration-300 ease-in-out hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  item.span,
                )}
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => setSelectedItem(item)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedItem(item)}
                tabIndex={0}
                aria-label={`View ${item.title}`}
              >
                <img
                  src={item.url}
                  alt={item.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <div className="relative z-10 translate-y-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <h3 className="text-lg font-serif font-bold text-white tracking-wide">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-xs sm:text-sm text-white/85 font-sans leading-snug">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {actionLabel && (
        <div className="mt-10 sm:mt-12 text-center">
          <button
            type="button"
            onClick={onActionClick}
            className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-[#002f89] text-[#002f89] text-xs sm:text-sm font-sans font-semibold hover:bg-[#002f89] hover:text-white transition-all duration-200 shadow-2xs cursor-pointer active:scale-95"
          >
            {actionLabel}
          </button>
        </div>
      )}

      <AnimatePresence>
        {selectedItem && (
          <ImageModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default InteractiveImageBentoGallery;
