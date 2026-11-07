"use client";

import React from "react";
import { FloatingButton, FloatingButtonItem } from "./floating-button";
import { Plus, MessageSquare } from "lucide-react";

export function FloatingButtonExample() {
  const items = [
    {
      label: "WhatsApp",
      href: "https://wa.me/919876543210",
      bgColor: "bg-[#25D366] hover:bg-[#20ba59]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.81 13.47 3.81 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.36 7.03 9.08 7.09 8.84 7.35C8.61 7.61 7.95 8.22 7.95 9.48C7.95 10.74 8.87 11.95 9 12.12C9.13 12.29 10.8 14.86 13.37 15.97C15.5 16.89 15.94 16.71 16.39 16.67C16.85 16.63 17.86 16.07 18.07 15.48C18.28 14.89 18.28 14.39 18.22 14.28C18.15 14.18 17.99 14.12 17.74 14C17.49 13.87 16.27 13.27 16.04 13.19C15.82 13.11 15.65 13.06 15.49 13.31C15.32 13.56 14.84 14.12 14.7 14.28C14.55 14.45 14.41 14.47 14.16 14.35C13.91 14.22 13.12 13.96 12.17 13.12C11.44 12.46 10.94 11.66 10.8 11.41C10.66 11.16 10.78 11.03 10.91 10.9C11.02 10.79 11.16 10.61 11.28 10.46C11.41 10.32 11.45 10.21 11.53 10.05C11.62 9.88 11.57 9.74 11.51 9.61C11.45 9.49 10.96 8.28 10.75 7.78C10.55 7.3 10.35 7.36 10.2 7.36C10.05 7.35 9.89 7.35 9.72 7.35L9.53 7.03Z" />
        </svg>
      ),
    },
    {
      label: "Instagram",
      href: "https://instagram.com",
      bgColor: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      ),
    },
    {
      label: "Facebook",
      href: "https://facebook.com",
      bgColor: "bg-[#1877f2] hover:bg-[#166fe5]",
      icon: (
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      ),
    },
  ];

  return (
    <FloatingButton
      triggerContent={
        <button
          type="button"
          aria-label="Contact Flyora"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#002f89] text-white shadow-xl cursor-pointer"
        >
          <MessageSquare className="w-7 h-7" strokeWidth={2} />
        </button>
      }
    >
      {items.map((item, key) => (
        <FloatingButtonItem key={key}>
          <a
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={item.label}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform hover:scale-110 active:scale-95 ${item.bgColor}`}
          >
            {item.icon}
          </a>
        </FloatingButtonItem>
      ))}
    </FloatingButton>
  );
}
