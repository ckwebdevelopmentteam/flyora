"use client";

import React, { ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type FloatingButtonProps = {
  className?: string;
  children: ReactNode;
  triggerContent: ReactNode;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export type FloatingButtonItemProps = {
  children: ReactNode;
  className?: string;
};

const list = {
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      staggerDirection: -1,
    },
  },
  hidden: {
    opacity: 0,
    transition: {
      when: "afterChildren",
      staggerChildren: 0.08,
    },
  },
};

const item = {
  visible: { opacity: 1, y: 0, scale: 1 },
  hidden: { opacity: 0, y: 10, scale: 0.8 },
};

const btn = {
  visible: { rotate: "45deg" },
  hidden: { rotate: 0 },
};

export function FloatingButton({
  className,
  children,
  triggerContent,
  isOpen: controlledIsOpen,
  onOpenChange,
}: FloatingButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const setIsOpen = (next: boolean) => {
    if (!isControlled) setUncontrolledIsOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`flex flex-col items-center relative ${className || ""}`}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.ul
            className="flex flex-col items-center absolute bottom-[calc(100%+14px)] gap-3 z-50 pointer-events-auto list-none p-0 m-0"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={list}
          >
            {children}
          </motion.ul>
        )}
      </AnimatePresence>
      <motion.div
        variants={btn}
        animate={isOpen ? "visible" : "hidden"}
        transition={{ duration: 0.22, ease: "easeInOut" }}
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer"
      >
        {triggerContent}
      </motion.div>
    </div>
  );
}

export function FloatingButtonItem({
  children,
  className,
}: FloatingButtonItemProps) {
  return (
    <motion.li variants={item} className={`list-none ${className || ""}`}>
      {children}
    </motion.li>
  );
}
