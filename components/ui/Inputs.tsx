import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const InputCst = ({ label, className, ...props }: InputProps) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</label>}
    <input
      className={cn(
        "bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FF80] focus:ring-1 focus:ring-[#00FF80] transition-all placeholder:text-zinc-600",
        className
      )}
      {...props}
    />
  </div>
);

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const SelectCst = ({ label, options, className, ...props }: SelectProps) => (
  <div className="flex flex-col gap-1 w-full">
    {label && <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</label>}
    <select
      className={cn(
        "bg-zinc-900/50 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#00FF80] focus:ring-1 focus:ring-[#00FF80] transition-all appearance-none",
        className
      )}
      {...props}
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

interface DaySelectorProps {
  label: string;
  selectedDays: number[];
  onChange: (days: number[]) => void;
  maxSelections?: number;
}

export const DaySelector = ({ label, selectedDays, onChange, maxSelections }: DaySelectorProps) => {
  const days = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  
  const toggleDay = (index: number) => {
    if (selectedDays.includes(index)) {
      onChange(selectedDays.filter(d => d !== index));
    } else {
      if (maxSelections && selectedDays.length >= maxSelections) {
        // Optional: Replace last or just block. Let's block.
        return; 
      }
      onChange([...selectedDays, index].sort());
    }
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{label}</label>
      <div className="flex justify-between gap-1">
        {days.map((day, idx) => {
          const isSelected = selectedDays.includes(idx);
          return (
            <button
              key={idx}
              type="button"
              onClick={() => toggleDay(idx)}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all",
                isSelected 
                  ? "bg-[#00FF80] text-black shadow-[0_0_10px_rgba(0,255,128,0.4)]" 
                  : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};
