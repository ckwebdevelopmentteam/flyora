import React from "react";
import * as LucideIcons from "lucide-react";

interface IconPlaceholderProps {
  lucide?: string;
  tabler?: string;
  hugeicons?: string;
  phosphor?: string;
  remixicon?: string;
  className?: string;
  size?: number | string;
  [key: string]: unknown;
}

export const IconPlaceholder: React.FC<IconPlaceholderProps> = ({
  lucide,
  className,
  size,
  ...rest
}) => {
  if (lucide) {
    const IconComponent = (
      LucideIcons as unknown as Record<
        string,
        React.ComponentType<{ className?: string; size?: number | string }>
      >
    )[lucide];
    if (IconComponent) {
      return <IconComponent className={className} size={size} {...rest} />;
    }
  }

  return <LucideIcons.Sparkles className={className} size={size} {...rest} />;
};
