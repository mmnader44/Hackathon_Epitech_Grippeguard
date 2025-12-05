import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Calendar } from 'lucide-react';

const TimeSlicer = ({ minYear = 2016, maxYear = 2024, value, onChange }) => {
  const [localValue, setLocalValue] = useState(value || [minYear, maxYear]);
  const [activeThumb, setActiveThumb] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      setLocalValue(value);
    }
  }, [value]);

  const handleChange = useCallback((newValue) => {
    setLocalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  }, [onChange]);

  const getPercent = (year) => ((year - minYear) / (maxYear - minYear)) * 100;

  const handleMouseDown = (thumb) => {
    setActiveThumb(thumb);
  };

  const handleMouseMove = useCallback((e) => {
    if (activeThumb === null || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const year = Math.round(minYear + (percent / 100) * (maxYear - minYear));
    const clampedYear = Math.max(minYear, Math.min(maxYear, year));

    if (activeThumb === 'min') {
      if (clampedYear <= localValue[1]) {
        handleChange([clampedYear, localValue[1]]);
      }
    } else {
      if (clampedYear >= localValue[0]) {
        handleChange([localValue[0], clampedYear]);
      }
    }
  }, [activeThumb, localValue, minYear, maxYear, handleChange]);

  const handleMouseUp = useCallback(() => {
    setActiveThumb(null);
  }, []);

  useEffect(() => {
    if (activeThumb !== null) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [activeThumb, handleMouseMove, handleMouseUp]);

  const minPercent = getPercent(localValue[0]);
  const maxPercent = getPercent(localValue[1]);

  return (
    <div className="space-y-4">
      {/* En-tête */}
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
          <Calendar className="h-3.5 w-3.5 text-white" />
        </div>
        <h3 className="text-sm font-semibold text-blue-800">
          Période
        </h3>
      </div>

      {/* Affichage des valeurs */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">De</span>
          <span className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 rounded-lg shadow-md">
            {localValue[0]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-600">À</span>
          <span className="text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 px-3 py-1.5 rounded-lg shadow-md">
            {localValue[1]}
          </span>
        </div>
      </div>

      {/* Double Range Slider */}
      <div 
        ref={containerRef}
        className="relative h-8 py-3"
      >
        {/* Track */}
        <div className="absolute top-1/2 left-0 right-0 h-2.5 bg-gray-200/60 rounded-full -translate-y-1/2">
          {/* Active range */}
          <div
            className="absolute h-2.5 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full -translate-y-1/2 top-1/2 shadow-md"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
        </div>

        {/* Min thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-white rounded-full shadow-xl cursor-pointer hover:scale-110 hover:shadow-2xl transition-all z-20"
          style={{ left: `calc(${minPercent}% - 10px)` }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleMouseDown('min');
          }}
        />

        {/* Max thumb */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-gradient-to-br from-blue-600 to-blue-700 border-2 border-white rounded-full shadow-xl cursor-pointer hover:scale-110 hover:shadow-2xl transition-all z-20"
          style={{ left: `calc(${maxPercent}% - 10px)` }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleMouseDown('max');
          }}
        />
      </div>

      {/* Labels des années */}
      <div className="flex justify-between text-xs text-gray-400 px-1">
        <span>{minYear}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  );
};

export default TimeSlicer;

