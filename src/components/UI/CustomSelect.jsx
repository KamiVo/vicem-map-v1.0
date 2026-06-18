import React, { useState, useRef, useEffect } from 'react';
import { FaChevronDown } from 'react-icons/fa';

const CustomSelect = ({ options, value, onChange, name, placeholder = "Chọn...", disabled = false, className = "", triggerClassName = "px-4 py-3 text-base" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => opt.value === value) || { label: placeholder, value: '' };

  return (
    <div className={`relative w-full ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`} ref={dropdownRef}>
      <div 
        className={`flex items-center justify-between w-full bg-white/50 border border-white/60 rounded-xl cursor-pointer ${!disabled && 'hover:bg-white focus:bg-white focus:ring-2 focus:ring-blue-500/50'} transition-all shadow-inner font-semibold text-gray-800 ${triggerClassName}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen(!isOpen);
          }
        }}
      >
        <span className="truncate">{selectedOption.label}</span>
        <FaChevronDown className={`text-gray-400 text-xs transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-[9999] w-full mt-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-fadeIn">
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
            {options.map((opt, idx) => (
              <div 
                key={idx}
                className={`px-4 py-2.5 my-0.5 cursor-pointer text-sm transition-colors rounded-lg ${value === opt.value ? 'bg-blue-50 text-blue-700 font-bold' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => {
                  onChange({ target: { name, value: opt.value } });
                  setIsOpen(false);
                }}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
