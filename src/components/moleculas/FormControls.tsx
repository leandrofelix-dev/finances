"use client";

import { Children, isValidElement, useMemo, useState, type InputHTMLAttributes, type ReactElement, type ReactNode } from "react";
import { CalendarIcon, Plus, Save, XCircle } from "lucide-react";

import { Button } from "@/components/atoms/Button";
import { Button as ShadButton } from "@/components/atoms/base-button";
import { Calendar } from "@/components/atoms/calendar";
import { Input } from "@/components/atoms/input";
import { Label } from "@/components/atoms/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/atoms/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/atoms/select";
import { cn } from "@/lib/utils";

export function Form({ className, ...props }: React.ComponentProps<"form">) {
  return (
    <form
      className={cn("grid gap-2.5 rounded-[var(--radius)] border border-border bg-background p-3.5", className)}
      {...props}
    />
  );
}

export function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("grid grid-cols-2 gap-2 max-[720px]:grid-cols-1", className)}
      {...props}
    />
  );
}

export function FullWidthField({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <Label
      className={cn("col-span-full grid gap-1.5 text-[0.78rem] font-semibold text-muted-foreground", className)}
      {...props}
    />
  );
}

export function StyledInput({ className, ...props }: React.ComponentProps<typeof Input>) {
  if (props.type === "date") {
    return <DateInput className={className} {...props} />;
  }

  return <Input className={className} {...props} />;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function parseDateInputValue(value: string) {
  if (!value) {
    return undefined;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) {
    return undefined;
  }

  return new Date(year, month - 1, day);
}

function normalizeInputDateValue(value: React.ComponentProps<typeof Input>["value"]) {
  return Array.isArray(value) ? String(value[0] ?? "") : String(value ?? "");
}

export function DateInput({
  className,
  defaultValue,
  name,
  onChange,
  required,
  value,
}: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [internalValue, setInternalValue] = useState(normalizeInputDateValue(defaultValue));
  const selectedValue = value === undefined ? internalValue : normalizeInputDateValue(value);
  const selectedDate = parseDateInputValue(selectedValue);

  function updateValue(date?: Date) {
    const nextValue = date ? toDateInputValue(date) : "";

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.({ target: { value: nextValue } } as React.ChangeEvent<HTMLInputElement>);
  }

  return (
    <>
      {name ? <input name={name} type="hidden" value={selectedValue} /> : null}
      <Popover>
        <PopoverTrigger
          render={
            <ShadButton
              aria-required={required}
              className={cn("h-9 w-full justify-start gap-2 px-3 font-normal", !selectedDate && "text-muted-foreground", className)}
              type="button"
              variant="outline"
            />
          }
        >
          <CalendarIcon size={16} />
          {selectedDate ? selectedDate.toLocaleDateString("pt-BR") : "Selecionar data"}
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar mode="single" onSelect={updateValue} selected={selectedDate} />
        </PopoverContent>
      </Popover>
    </>
  );
}

type OptionElement = ReactElement<React.ComponentProps<"option">, "option">;

function optionText(children: ReactNode) {
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }

  return Children.toArray(children).join("");
}

export function StyledSelect({
  children,
  className,
  defaultValue,
  name,
  onChange,
  value,
}: Omit<React.ComponentProps<"select">, "className" | "children" | "defaultValue" | "onChange" | "value"> & {
  children: ReactNode;
  className?: string;
  defaultValue?: string | number | readonly string[];
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  value?: string | number | readonly string[];
}) {
  const options = useMemo(
    () =>
      Children.toArray(children)
        .filter(isValidElement)
        .filter((child): child is OptionElement => child.type === "option")
        .map((child) => ({
          disabled: child.props.disabled,
          label: optionText(child.props.children),
          value: String(child.props.value ?? ""),
        })),
    [children]
  );
  const firstValue = options[0]?.value ?? "";
  const normalizeValue = (nextValue: typeof value | typeof defaultValue) =>
    Array.isArray(nextValue) ? String(nextValue[0] ?? firstValue) : String(nextValue ?? firstValue);
  const [internalValue, setInternalValue] = useState(normalizeValue(defaultValue));
  const selectedValue = value === undefined ? internalValue : normalizeValue(value);
  const selectedOption = options.find((option) => option.value === selectedValue);

  function updateValue(nextValue: string | null) {
    if (nextValue === null) {
      return;
    }

    if (value === undefined) {
      setInternalValue(nextValue);
    }

    onChange?.({ target: { value: nextValue } } as React.ChangeEvent<HTMLSelectElement>);
  }

  return (
    <>
      {name ? <input name={name} type="hidden" value={selectedValue} /> : null}
      <Select onValueChange={updateValue} value={selectedValue}>
        <SelectTrigger className={className}>
          <SelectValue>{selectedOption?.label ?? "Selecione"}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem disabled={option.disabled} key={option.value || "__empty"} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  );
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return <Label className={cn("grid gap-1.5 text-[0.78rem] font-semibold text-muted-foreground", className)} {...props} />;
}

function AdornedInputWrap({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("relative block", className)} {...props} />;
}

function InputAdornment({ className, side, ...props }: React.ComponentProps<"span"> & { side: "left" | "right" }) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute top-1/2 -translate-y-1/2 text-[0.82rem] font-bold text-muted-foreground",
        side === "left" ? "left-2.5" : "right-2.5",
        className
      )}
      {...props}
    />
  );
}

function NumberInput({ className, prefix, suffix, ...props }: React.ComponentProps<typeof Input> & { prefix?: string; suffix?: string }) {
  return (
    <Input
      className={cn(prefix && "pl-9", suffix && "pr-8", className)}
      type="number"
      {...props}
    />
  );
}

function Actions({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-wrap items-center gap-2", className)} {...props} />;
}

type FieldProps = {
  children: ReactNode;
  label: string;
  fullWidth?: boolean;
};

type AdornedNumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "type">;

export function Field({ children, label, fullWidth }: FieldProps) {
  const Component = fullWidth ? FullWidthField : FieldLabel;

  return (
    <Component>
      <span>{label}</span>
      {children}
    </Component>
  );
}

function AdornedNumberInput({
  prefix,
  suffix,
  ...props
}: AdornedNumberInputProps & { prefix?: string; suffix?: string }) {
  return (
    <AdornedInputWrap>
      {prefix ? <InputAdornment side="left">{prefix}</InputAdornment> : null}
      <NumberInput {...props} prefix={prefix} suffix={suffix} />
      {suffix ? <InputAdornment side="right">{suffix}</InputAdornment> : null}
    </AdornedInputWrap>
  );
}

export function MoneyInput(props: AdornedNumberInputProps) {
  return <AdornedNumberInput {...props} prefix="R$" />;
}

export function PercentInput(props: AdornedNumberInputProps) {
  return <AdornedNumberInput {...props} suffix="%" />;
}

export function FormActions({ editing, onCancel }: { editing: boolean; onCancel: () => void }) {
  return (
    <Actions>
      <Button type="submit">
        {editing ? <Save size={16} /> : <Plus size={16} />}
        {editing ? "Atualizar" : "Cadastrar"}
      </Button>
      {editing ? (
        <Button onClick={onCancel} type="button" variant="secondary">
          <XCircle size={16} />
          Cancelar edição
        </Button>
      ) : null}
    </Actions>
  );
}
