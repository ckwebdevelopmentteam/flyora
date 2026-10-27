import { useId, useState } from "react";
import { X, Plus, Check, Minus } from "lucide-react";
interface TagInputProps {
  label: string;
  helperText?: string;
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  presets?: string[];
  variant?: "default" | "inclusion" | "exclusion";
}
export function TagInput({
  label,
  tags,
  onChange,
  placeholder = "Add an item",
  presets = [],
  variant = "default",
}: TagInputProps) {
  const id = useId();
  const [value, setValue] = useState("");
  const add = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase()))
      onChange([...tags, trimmed]);
    setValue("");
  };
  const Icon = variant === "inclusion" ? Check : Minus;
  return (
    <section className={`package-tag-editor package-tag-${variant}`}>
      <div className="flex justify-between items-center gap-3 mb-4">
        <h3 className="font-semibold text-sm">{label}</h3>
        <span className="text-xs text-slate-400">{tags.length} items</span>
      </div>
      <ul className="package-tag-list">
        {tags.map((tag, index) => (
          <li key={`${tag}-${index}`}>
            <Icon size={15} aria-hidden="true" />
            <span>{tag}</span>
            <button
              type="button"
              aria-label={`Remove ${tag}`}
              onClick={() => onChange(tags.filter((_, i) => i !== index))}
            >
              <X size={14} />
            </button>
          </li>
        ))}
      </ul>
      {!tags.length && (
        <p className="text-sm text-slate-400 mb-4">No items added</p>
      )}
      <label htmlFor={id} className="sr-only">
        Add to {label.toLowerCase()}
      </label>
      <div className="flex gap-2 mt-4">
        <input
          id={id}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add(value);
            }
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 border rounded-md px-3 py-2 text-sm"
        />
        <button
          type="button"
          aria-label={`Add to ${label.toLowerCase()}`}
          className="button-secondary"
          disabled={!value.trim()}
          onClick={() => add(value)}
        >
          <Plus size={16} />
          <span>Add</span>
        </button>
      </div>
      {!!presets.length && (
        <details className="package-tag-presets">
          <summary>Common items</summary>
          <div>
            {presets
              .filter(
                (preset) =>
                  !tags.some(
                    (tag) => tag.toLowerCase() === preset.toLowerCase(),
                  ),
              )
              .map((preset) => (
                <button type="button" key={preset} onClick={() => add(preset)}>
                  <Plus size={12} />
                  {preset}
                </button>
              ))}
          </div>
        </details>
      )}
    </section>
  );
}
