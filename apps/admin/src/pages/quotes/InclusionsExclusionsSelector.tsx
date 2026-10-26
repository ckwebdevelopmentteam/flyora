import React, { useState } from "react";
import { Plus, X, Check, ShieldAlert, Sparkles } from "lucide-react";
import { COMMON_INCLUSIONS, COMMON_EXCLUSIONS } from "./types";

interface InclusionsExclusionsSelectorProps {
  inclusions: string[];
  exclusions: string[];
  onChangeInclusions: (inclusions: string[]) => void;
  onChangeExclusions: (exclusions: string[]) => void;
}

export const InclusionsExclusionsSelector: React.FC<
  InclusionsExclusionsSelectorProps
> = ({ inclusions, exclusions, onChangeInclusions, onChangeExclusions }) => {
  const [customInc, setCustomInc] = useState("");
  const [customExc, setCustomExc] = useState("");

  const handleAddInclusion = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !inclusions.includes(trimmed)) {
      onChangeInclusions([...inclusions, trimmed]);
      setCustomInc("");
    }
  };

  const handleRemoveInclusion = (itemToRemove: string) => {
    onChangeInclusions(inclusions.filter((item) => item !== itemToRemove));
  };

  const handleAddExclusion = (item: string) => {
    const trimmed = item.trim();
    if (trimmed && !exclusions.includes(trimmed)) {
      onChangeExclusions([...exclusions, trimmed]);
      setCustomExc("");
    }
  };

  const handleRemoveExclusion = (itemToRemove: string) => {
    onChangeExclusions(exclusions.filter((item) => item !== itemToRemove));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Inclusions Column */}
      <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Included ({inclusions.length})
          </label>
        </div>

        {/* Selected Inclusions Chips */}
        <div className="min-h-16 flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#FAFAF9] border border-zinc-200/70">
          {inclusions.length === 0 ? (
            <span className="text-[11px] text-zinc-400 italic">
              Add what is included in the price.
            </span>
          ) : (
            inclusions.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 animate-in fade-in duration-150"
              >
                <Check className="w-3 h-3 text-emerald-600" />
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveInclusion(item)}
                  aria-label={`Remove ${item}`}
                  className="p-0.5 rounded hover:bg-emerald-200/50 text-emerald-700 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add custom inclusion input */}
        <div className="flex gap-1.5">
          <input
            type="text"
            aria-label="Add an included service"
            placeholder="Add something included"
            value={customInc}
            onChange={(e) => setCustomInc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddInclusion(customInc);
              }
            }}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400"
          />
          <button
            type="button"
            aria-label="Add included service"
            onClick={() => handleAddInclusion(customInc)}
            disabled={!customInc.trim()}
            className="px-2.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-40 text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preset quick suggestions */}
        <details className="pt-1">
          <summary className="cursor-pointer text-xs text-slate-500 mb-2">
            Choose from common options
          </summary>
          <div className="flex flex-wrap gap-1">
            {COMMON_INCLUSIONS.map((suggestion) => {
              const isSelected = inclusions.includes(suggestion);
              return (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isSelected}
                  onClick={() => handleAddInclusion(suggestion)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                    isSelected
                      ? "opacity-40 bg-zinc-100 text-zinc-400 border-zinc-200 cursor-default"
                      : "bg-white hover:bg-emerald-50 text-zinc-600 hover:text-emerald-800 border-zinc-200 hover:border-emerald-300"
                  }`}
                >
                  + {suggestion}
                </button>
              );
            })}
          </div>
        </details>
      </div>

      {/* Exclusions Column */}
      <div className="p-4 rounded-xl border border-zinc-200 bg-white space-y-3 shadow-2xs">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-zinc-900 flex items-center gap-1.5 uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5 text-zinc-500" />
            Not included ({exclusions.length})
          </label>
        </div>

        {/* Selected Exclusions Chips */}
        <div className="min-h-16 flex flex-wrap gap-1.5 p-2 rounded-lg bg-[#FAFAF9] border border-zinc-200/70">
          {exclusions.length === 0 ? (
            <span className="text-[11px] text-zinc-400 italic">
              Add what the customer pays for separately.
            </span>
          ) : (
            exclusions.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-800 border border-zinc-300 animate-in fade-in duration-150"
              >
                <span>{item}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveExclusion(item)}
                  aria-label={`Remove ${item}`}
                  className="p-0.5 rounded hover:bg-zinc-200 text-zinc-600 transition"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))
          )}
        </div>

        {/* Add custom exclusion input */}
        <div className="flex gap-1.5">
          <input
            type="text"
            aria-label="Add an excluded service"
            placeholder="Add something not included"
            value={customExc}
            onChange={(e) => setCustomExc(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddExclusion(customExc);
              }
            }}
            className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-zinc-200 focus:outline-hidden focus:ring-1 focus:ring-black placeholder:text-zinc-400"
          />
          <button
            type="button"
            aria-label="Add excluded service"
            onClick={() => handleAddExclusion(customExc)}
            disabled={!customExc.trim()}
            className="px-2.5 py-1.5 rounded-lg bg-black text-white hover:bg-zinc-800 disabled:opacity-40 text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Preset quick suggestions */}
        <details className="pt-1">
          <summary className="cursor-pointer text-xs text-slate-500 mb-2">
            Choose from common options
          </summary>
          <div className="flex flex-wrap gap-1">
            {COMMON_EXCLUSIONS.map((suggestion) => {
              const isSelected = exclusions.includes(suggestion);
              return (
                <button
                  key={suggestion}
                  type="button"
                  disabled={isSelected}
                  onClick={() => handleAddExclusion(suggestion)}
                  className={`text-[10px] px-2 py-0.5 rounded-md border transition ${
                    isSelected
                      ? "opacity-40 bg-zinc-100 text-zinc-400 border-zinc-200 cursor-default"
                      : "bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  + {suggestion}
                </button>
              );
            })}
          </div>
        </details>
      </div>
    </div>
  );
};
