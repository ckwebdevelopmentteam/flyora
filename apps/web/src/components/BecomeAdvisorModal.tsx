"use client";

import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  Sparkles,
  Send,
  Award,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

interface BecomeAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BecomeAdvisorModal: React.FC<BecomeAdvisorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [experience, setExperience] = useState("intermediate");
  const [specialization, setSpecialization] = useState("luxury");
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFullName("");
    setEmail("");
    setPhone("");
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="advisor-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden text-zinc-900 animate-in zoom-in-95 duration-200">
        {/* Header decoration */}
        <div className="bg-[#463d34] text-white px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-amber-200">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-amber-200/90">
                Partner Program
              </p>
              <h2
                id="advisor-modal-title"
                className="text-base font-serif font-medium tracking-wide"
              >
                Become a Flyora Advisor
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold font-serif text-zinc-900">
              Application Received!
            </h3>
            <p className="text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
              Thank you,{" "}
              <span className="font-semibold">{fullName || "Advisor"}</span>.
              Our travel partnership director will review your background and
              reach out via phone or email within 24 hours.
            </p>
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 text-left text-xs text-zinc-600 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>What happens next:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1 text-zinc-500 text-[11px]">
                <li>Direct access to net DMC rates across 50+ countries</li>
                <li>Comprehensive booking & quotation tooling</li>
                <li>Dedicated regional partner support</li>
              </ul>
            </div>
            <button
              onClick={handleReset}
              className="w-full py-3 rounded-xl bg-[#463d34] hover:bg-[#38312a] text-white text-xs font-semibold uppercase tracking-wider transition"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <p className="text-xs text-zinc-600 leading-relaxed">
              Join Flyora&apos;s curated network of luxury travel specialists.
              Gain direct supplier inventory, fast client quotations, and
              competitive commissions.
            </p>

            <div className="space-y-3">
              <div>
                <label
                  htmlFor="advisor-fullname"
                  className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="advisor-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#463d34]/20 focus:border-[#463d34]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="advisor-email"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    id="advisor-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sarah@luxurytravel.com"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#463d34]/20 focus:border-[#463d34]"
                  />
                </div>
                <div>
                  <label
                    htmlFor="advisor-phone"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                  >
                    Phone / WhatsApp *
                  </label>
                  <input
                    id="advisor-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-zinc-300 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-[#463d34]/20 focus:border-[#463d34]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="advisor-experience"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                  >
                    Experience Level
                  </label>
                  <select
                    id="advisor-experience"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#463d34]/20 focus:border-[#463d34]"
                  >
                    <option value="aspiring">New / Aspiring Advisor</option>
                    <option value="intermediate">1-3 Years Experience</option>
                    <option value="senior">3-5+ Years Experience</option>
                    <option value="agency">Agency Owner / Team Lead</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="advisor-specialization"
                    className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-700 mb-1"
                  >
                    Primary Specialty
                  </label>
                  <select
                    id="advisor-specialization"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-zinc-300 text-xs text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#463d34]/20 focus:border-[#463d34]"
                  >
                    <option value="luxury">Luxury Custom Holidays</option>
                    <option value="visas">International Visas & Flights</option>
                    <option value="umrah">Umrah & Spiritual Journeys</option>
                    <option value="corporate">Corporate & MICE Travel</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl bg-[#463d34] hover:bg-[#38312a] text-white text-xs font-semibold uppercase tracking-wider transition flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60 cursor-pointer shadow-md"
              >
                {isSubmitting ? (
                  <span>Submitting Application...</span>
                ) : (
                  <>
                    <span>Submit Advisor Application</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
