"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface MultiSelectProps {
  options: { label: string; value: string }[];
  value: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  className?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select options",
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleValue = (val: string) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className="w-full rounded-lg border border-input bg-background px-4 py-2 text-left text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary flex justify-between items-center"
      >
        <span className="truncate">
          {value.length
            ? options
                .filter((opt) => value.includes(opt.value))
                .map((opt) => opt.label)
                .join(", ")
            : placeholder}
        </span>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 transition-transform",
            isOpen ? "rotate-180" : "rotate-0"
          )}
        />
      </button>

      {/* Animated Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-1 w-full rounded-md border border-input bg-background shadow-lg max-h-60 overflow-auto"
          >
            {options.map((opt) => {
              const selected = value.includes(opt.value);
              return (
                <motion.div
                  key={opt.value}
                  layout
                  className={cn(
                    "cursor-pointer select-none px-4 py-2 text-sm flex items-center justify-between hover:bg-accent hover:text-accent-foreground",
                    selected && "bg-accent text-accent-foreground"
                  )}
                  onClick={() => toggleValue(opt.value)}
                >
                  {opt.label}
                  {selected && <Check className="h-4 w-4" />}
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
