import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface AutocompleteOption {
  id: string;
  label: string;
  sublabel?: string;
  badge?: string;
  keywords?: string;
}

interface CatalogAutocompleteProps {
  id?: string;
  value: string;
  placeholder: string;
  options: AutocompleteOption[];
  onChangeText: (text: string) => void;
  onSelectOption: (option: AutocompleteOption) => void;
  className?: string;
}

export function CatalogAutocomplete({
  id,
  value,
  placeholder,
  options,
  onChangeText,
  onSelectOption,
  className = "",
}: CatalogAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    return () => document.removeEventListener("mousedown", onMouseDown);
  }, []);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options.slice(0, 12);
    return options
      .filter((opt) => {
        const hay =
          `${opt.label} ${opt.sublabel || ""} ${opt.badge || ""} ${opt.keywords || ""}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 12);
  }, [value, options]);

  const selectOption = (option: AutocompleteOption) => {
    onSelectOption(option);
    setOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative flex items-center">
        <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none" />
        <input
          id={id}
          type="text"
          value={value}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={open && filtered.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined
          }
          onFocus={() => {
            setOpen(true);
            setActiveIndex(-1);
          }}
          onChange={(e) => {
            onChangeText(e.target.value);
            setOpen(true);
            setActiveIndex(-1);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              if (filtered.length === 0) return;
              setOpen(true);
              setActiveIndex((index) =>
                Math.min(index + 1, filtered.length - 1),
              );
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              if (filtered.length === 0) return;
              setActiveIndex((index) => Math.max(index - 1, 0));
            } else if (
              event.key === "Enter" &&
              activeIndex >= 0 &&
              filtered[activeIndex]
            ) {
              event.preventDefault();
              selectOption(filtered[activeIndex]);
            } else if (event.key === "Escape") {
              setOpen(false);
              setActiveIndex(-1);
            }
          }}
          className={`catalog-autocomplete-input w-full ${className}`}
        />
        <button
          type="button"
          onClick={() => {
            setOpen((isOpen) => !isOpen);
            setActiveIndex(-1);
          }}
          aria-expanded={open}
          aria-controls={listboxId}
          aria-label="Toggle suggestions"
          className="absolute right-2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && filtered.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-40 max-h-56 overflow-y-auto py-1"
        >
          {filtered.map((opt, index) => (
            <button
              key={opt.id}
              type="button"
              id={`${listboxId}-option-${index}`}
              role="option"
              aria-selected={activeIndex === index}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(opt);
              }}
              className={`w-full px-3 py-2 text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                activeIndex === index ? "bg-blue-50/70" : "hover:bg-blue-50/70"
              }`}
            >
              <div className="min-w-0">
                <div className="text-xs font-medium text-zinc-900 truncate">
                  {opt.label}
                </div>
                {opt.sublabel && (
                  <div className="text-[11px] text-zinc-500 truncate">
                    {opt.sublabel}
                  </div>
                )}
              </div>
              {opt.badge && (
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-zinc-100 text-zinc-700 rounded shrink-0">
                  {opt.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
