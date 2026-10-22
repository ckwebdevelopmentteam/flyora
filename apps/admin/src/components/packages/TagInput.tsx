import { useState, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";

interface TagInputProps {
  label: string;
  helperText?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  presets?: string[];
  variant?: "default" | "inclusion" | "exclusion";
}

export const TagInput = ({
  label,
  helperText,
  tags,
  onChange,
  placeholder = "Type and press Enter...",
  presets = [],
  variant = "default",
}: TagInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = (text: string) => {
    const trimmed = text.trim().replace(/^,+|,+$/g, "");
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
  };

  const removeTag = (indexToRemove: number) => {
    onChange(tags.filter((_, idx) => idx !== indexToRemove));
  };

  const badgeStyles =
    variant === "inclusion"
      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
      : variant === "exclusion"
        ? "bg-zinc-100 border-zinc-300 text-zinc-700"
        : "bg-white border-zinc-200 text-zinc-800";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-zinc-900 tracking-tight">
          {label}
        </label>
        <span className="text-[10px] text-zinc-400 font-mono">
          {tags.length} added
        </span>
      </div>

      {helperText && (
        <p className="text-[11px] text-zinc-500 font-mono">{helperText}</p>
      )}

      {/* Preset Suggestions */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          <span className="text-[10px] text-zinc-400 font-mono self-center mr-1">
            Suggestions:
          </span>
          {presets.map((preset) => {
            const isAdded = tags.includes(preset);
            return (
              <button
                type="button"
                key={preset}
                disabled={isAdded}
                onClick={() => addTag(preset)}
                className={`text-[11px] px-2 py-0.5 rounded-full border transition flex items-center gap-1 font-mono ${
                  isAdded
                    ? "opacity-40 bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                    : "bg-white border-zinc-200 text-zinc-700 hover:border-black hover:text-black cursor-pointer shadow-xs"
                }`}
              >
                <Plus className="w-2.5 h-2.5" />
                <span>{preset}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Active Tags & Input Container */}
      <div className="min-h-[42px] p-2 rounded-lg border border-zinc-200 bg-[#FAFAF9] flex flex-wrap gap-1.5 items-center focus-within:border-black focus-within:bg-white transition shadow-xs">
        {tags.map((tag, idx) => (
          <span
            key={`${tag}-${idx}`}
            className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border font-medium shadow-xs ${badgeStyles}`}
          >
            <span>{tag}</span>
            <button
              type="button"
              onClick={() => removeTag(idx)}
              className="text-zinc-400 hover:text-black transition"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(inputValue)}
          placeholder={tags.length === 0 ? placeholder : "Add another..."}
          className="flex-1 min-w-[140px] text-xs bg-transparent outline-none text-zinc-900 placeholder:text-zinc-400 px-1 py-1"
        />
      </div>
    </div>
  );
};
