"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import { Field, StyledInput } from "@/components/moleculas/FormControls";

export function ColorPicker({
  defaultValue,
  label,
  name = "color",
  onChange,
  options,
  value,
}: {
  defaultValue: string;
  label: string;
  name?: string;
  onChange?: (color: string) => void;
  options: string[];
  value?: string;
}) {
  const [internalColor, setInternalColor] = useState(defaultValue);
  const selectedColor = value ?? internalColor;
  const colorPickerValue = /^#[0-9A-Fa-f]{6}$/.test(selectedColor) ? selectedColor : "#10b981";

  const updateColor = (color: string) => {
    if (value === undefined) setInternalColor(color);
    onChange?.(color);
  };

  return (
    <Field fullWidth label={label}>
      <input name={name} type="hidden" value={selectedColor} />
      <div className="grid gap-2.5">
        <label className="relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-xl border border-border bg-background px-2.5 py-2 text-[0.86rem] font-bold text-foreground transition-colors hover:border-primary hover:bg-muted/50">
          <span
            className="h-7 w-7 flex-none rounded-[9px] border-2 border-white shadow-[0_0_0_1px_var(--fynix-border)]"
            style={{ backgroundColor: selectedColor }}
          />
          <span>{selectedColor.toUpperCase()}</span>
          <input
            aria-label={`Selecionar ${label.toLowerCase()}`}
            className="absolute inset-0 cursor-pointer opacity-0"
            onChange={(event) => updateColor(event.target.value)}
            type="color"
            value={colorPickerValue}
          />
        </label>
        <div className="grid grid-cols-6 gap-2" aria-label="Cores sugeridas">
          {options.map((color) => (
            <button
              className={cn(
                "h-8 rounded-[10px] border-2 border-white transition-transform hover:-translate-y-px hover:shadow-[0_0_0_2px_var(--fynix-accent)]",
                selectedColor === color
                  ? "shadow-[0_0_0_2px_var(--fynix-accent)]"
                  : "shadow-[0_0_0_1px_var(--fynix-border)]"
              )}
              key={color}
              aria-label={`Usar cor ${color}`}
              style={{ backgroundColor: color }}
              onClick={() => updateColor(color)}
              type="button"
            />
          ))}
        </div>
        <StyledInput
          aria-label="Código hexadecimal da cor"
          onChange={(event) => updateColor(event.target.value)}
          pattern="^#[0-9A-Fa-f]{6}$"
          placeholder="#10b981"
          value={selectedColor}
        />
      </div>
    </Field>
  );
}
