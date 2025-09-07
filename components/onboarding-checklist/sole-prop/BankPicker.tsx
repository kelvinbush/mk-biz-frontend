"use client";

import React, { useMemo, useState } from "react";

export type BankOption = { code: string; name: string };

type BankPickerProps = {
  options: BankOption[];
  value?: string;
  onChange: (code: string) => void;
  placeholder?: string;
};

export default function BankPicker({ options, value, onChange, placeholder = "Search bank..." }: BankPickerProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((b) => b.name.toLowerCase().includes(q) || b.code.toLowerCase().includes(q));
  }, [options, query]);

  return (
    <div className="space-y-3">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-green"
      />
      <div role="radiogroup" aria-label="Select your bank" className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 max-h-56 overflow-auto pr-1">
        {filtered.map((bank) => {
          const selected = value === bank.code;
          return (
            <button
              key={bank.code}
              role="radio"
              aria-checked={selected}
              type="button"
              onClick={() => onChange(bank.code)}
              className={
                "text-left rounded-md border px-3 py-2 text-sm transition " +
                (selected
                  ? "border-primary-green bg-primary-green/10 text-primary-green"
                  : "border-gray-200 hover:bg-gray-50")
              }
            >
              <span className="block font-medium">{bank.name}</span>
              <span className="block text-[10px] text-gray-500">{bank.code}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center text-xs text-gray-500 py-4">No banks match your search.</div>
        )}
      </div>
    </div>
  );
}
