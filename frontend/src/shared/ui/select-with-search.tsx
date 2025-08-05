'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

interface Option {
  label: string;
  value: string;
  description?: string;
  uniqueKey?: string;
}

interface SelectWithSearchProps {
  placeholder?: string;
  options: Option[];
  value?: string;
  onChange?: (value: string) => void;
  onLabelChange?: (label: string) => void;
  searchPlaceholder?: string;
  className?: string;
  displayMode?: 'value' | 'label';
}

export const SelectWithSearch: React.FC<SelectWithSearchProps> = ({
  placeholder = 'Выберите...',
  options,
  value,
  onChange,
  onLabelChange,
  searchPlaceholder = 'Поиск...',
  className = '',
  displayMode = 'label',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [inputValue, setInputValue] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = options.filter(
    (option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (option.description &&
        option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleClickOutside = (e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current?.contains(e.target as Node)
    ) {
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleSelect = (option: Option) => {
    onChange?.(option.value);
    onLabelChange?.(option.label);
    setInputValue(option.label);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setSearchTerm(newValue);

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  const handleClear = () => {
    onChange?.('');
    onLabelChange?.('');
    setInputValue('');
    setSearchTerm('');
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setSearchTerm('');
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (selectedOption) {
      setInputValue(
        displayMode === 'value' ? selectedOption.value : selectedOption.label
      );
    } else {
      setInputValue('');
    }
  }, [selectedOption, displayMode]);

  return (
    <div ref={containerRef} className={`relative w-full text-sm ${className}`}>
      <div className="relative">
        <div className="flex items-center border border-gray-300 rounded-md bg-white hover:border-gray-400 focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500">
          <Search className="w-4 h-4 text-gray-400 ml-3 flex-shrink-0" />
          <input
            ref={searchInputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-gray-700 bg-transparent border-none outline-none placeholder-gray-400"
            onClick={handleToggle}
          />
          {inputValue && (
            <button
              onClick={handleClear}
              className="p-1 mr-2 text-gray-400 hover:text-gray-600"
              aria-label="Очистить поле"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleToggle}
            className="p-2 text-gray-400 hover:text-gray-600 border-l border-gray-300"
            aria-label="Открыть список опций"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-1 border border-gray-300 rounded-md shadow-lg bg-white max-h-60 overflow-hidden">
          {filteredOptions.length === 0 ? (
            <div className="px-3 py-2 text-gray-500 text-center">
              Ничего не найдено
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto">
              {filteredOptions.map((option) => (
                <div
                  key={option.uniqueKey || option.value}
                  onClick={() => handleSelect(option)}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="font-medium text-gray-900">
                    {option.label}
                  </div>
                  {option.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 font-mono">
                    {option.value}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
