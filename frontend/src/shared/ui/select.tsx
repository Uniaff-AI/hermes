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
}

export const Select: React.FC<SelectProps> = ({
  placeholder = 'Выберите...',
  options,
  value,
  onChange,
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
    onChange?.(val);
    setIsOpen(false);
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full text-sm">
      <div
        className="w-full border border-gray-300 px-3 py-2 rounded-md bg-white cursor-pointer text-gray-700 hover:border-gray-400"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {selectedLabel || <span className="text-gray-400">{placeholder}</span>}
      </div>
      {isOpen && (
        <div className="absolute z-20 w-full mt-1 border border-gray-300 rounded-md shadow bg-white">
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
