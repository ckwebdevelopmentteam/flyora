import { useEffect, useMemo, useRef, useState } from "react";
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
  const containerRef = useRef<HTMLDivElement>(null);

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
          onFocus={() => setOpen(true)}
          onChange={(e) => {
            onChangeText(e.target.value);
            setOpen(true);
          }}
          className={`w-full pl-8 pr-7 ${className}`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle suggestions"
          className="absolute right-2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      {open && filtered.length > 0 && (
        <div
          role="listbox"
          className="absolute left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg z-40 max-h-56 overflow-y-auto py-1"
        >
          {filtered.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onSelectOption(opt);
                setOpen(false);
              }}
              className="w-full px-3 py-2 text-left hover:bg-indigo-50/70 flex items-center justify-between gap-2 transition-colors cursor-pointer"
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
