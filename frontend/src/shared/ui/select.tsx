'use client';

import * as React from 'react';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  placeholder = 'Выберите...',
  options,
  value,
  onChange,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  const handleClickOutside = (e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current?.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  const handleSelect = (val: string) => {
    if (!disabled) {
      onChange?.(val);
      setIsOpen(false);
    }
  };

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full text-sm">
      <div
        className={`w-full border border-gray-300 px-3 py-2 rounded-md bg-white text-gray-700 transition-colors ${disabled
          ? 'cursor-not-allowed bg-gray-50 text-gray-400'
          : 'cursor-pointer hover:border-gray-400 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500'
          }`}
        onClick={handleToggle}
      >
        {selectedLabel || <span className="text-gray-400">{placeholder}</span>}
      </div>
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 border border-gray-300 rounded-md shadow-lg bg-white max-h-60 overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt.value}
              onClick={() => handleSelect(opt.value)}
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
