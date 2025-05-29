// components/PriceFilter.tsx
"use client";

import React, { useState, useEffect } from "react";
import Range from "rc-slider";
import "rc-slider/assets/index.css"; // Ensure rc-slider CSS is imported
import useDebounce from "@/app/hooks/useDebounce";
interface PriceFilterProps {
  // These are the overall min/max bounds for the slider, typically from the API
  initialMin: number;
  initialMax: number;
  // Callback to notify parent component of the debounced price range change
  onDebouncedChange: (range: [number, number]) => void;
}

const PriceFilter: React.FC<PriceFilterProps> = ({
  initialMin,
  initialMax,
  onDebouncedChange,
}) => {
  // Internal state for the slider's current thumb positions
  const [currentSliderRange, setCurrentSliderRange] = useState<
    [number, number]
  >([initialMin, initialMax]);

  // Debounce the slider's current values before notifying the parent
  const debouncedSliderMin = useDebounce(currentSliderRange[0], 500);
  const debouncedSliderMax = useDebounce(currentSliderRange[1], 500);

  // Effect to update currentSliderRange if initialMin/Max props change (e.g., after API loads)
  useEffect(() => {
    // Only update if the component just mounted or initial values changed significantly
    // and the current slider range is still at its default or outside the new bounds
    if (
      currentSliderRange[0] === 0 &&
      currentSliderRange[1] === 10000 &&
      initialMin !== 0 &&
      initialMax !== 10000
    ) {
      setCurrentSliderRange([initialMin, initialMax]);
    }
  }, [initialMin, initialMax]);

  // Effect to call the parent's callback when the debounced range changes
  useEffect(() => {
    // Ensure the debounced values are within valid bounds before sending
    const finalMin = Math.max(initialMin, debouncedSliderMin);
    const finalMax = Math.min(initialMax, debouncedSliderMax);

    // Only trigger if a valid range is selected and debounced values are different from initial values
    // to avoid an infinite loop or unnecessary calls
    if (
      !isNaN(finalMin) &&
      !isNaN(finalMax) &&
      (finalMin !== initialMin || finalMax !== initialMax)
    ) {
      onDebouncedChange([finalMin, finalMax]);
    }
  }, [
    debouncedSliderMin,
    debouncedSliderMax,
    initialMin,
    initialMax,
    onDebouncedChange,
  ]);

  // Handler for the rc-slider's onChange event
  const handleSliderChange = (values: number | number[]) => {
    if (Array.isArray(values) && values.length === 2) {
      const minVal = values[0];
      const maxVal = values[1];

      // Ensure min doesn't go above max and vice-versa during drag
      const newMin = Math.min(minVal, maxVal);
      const newMax = Math.max(minVal, maxVal);

      setCurrentSliderRange([newMin, newMax]);
    } else {
      console.warn(
        "PriceFilter received a single number from slider (expected array):",
        values
      );
      // Fallback for unexpected single number (should not happen with Range)
      setCurrentSliderRange([values as number, values as number]);
    }
  };

  // Handlers for the hidden numerical inputs (if they were visible)
  const handleMinPriceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = parseFloat(e.target.value);
    if (!isNaN(inputValue)) {
      const newMin = Math.max(
        initialMin,
        Math.min(inputValue, currentSliderRange[1])
      );
      setCurrentSliderRange([newMin, currentSliderRange[1]]);
    }
  };

  const handleMaxPriceInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = parseFloat(e.target.value);
    if (!isNaN(inputValue)) {
      const newMax = Math.min(
        initialMax,
        Math.max(inputValue, currentSliderRange[0])
      );
      setCurrentSliderRange([currentSliderRange[0], newMax]);
    }
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-6">Price Range</h3>
      {/* Dynamic Price display boxes matching image_8f3e32.png */}
      <div className="flex justify-between items-center mb-6">
        <div
          className="text-gray-800 px-3 py-1 text-base font-semibold"
          style={{ minWidth: "100px", textAlign: "left" }}
        >
          ₹
          {typeof currentSliderRange[0] === "number"
            ? currentSliderRange[0].toFixed(2)
            : "0.00"}
        </div>
        <div
          className="text-gray-800 px-3 py-1 text-base font-semibold"
          style={{ minWidth: "100px", textAlign: "right" }}
        >
          ₹
          {typeof currentSliderRange[1] === "number"
            ? currentSliderRange[1].toFixed(2)
            : "0.00"}
        </div>
      </div>
      {/* rc-slider Range Component */}
      <Range
        min={initialMin} // Overall minimum bound from API
        max={initialMax} // Overall maximum bound from API
        value={currentSliderRange} // The currently selected min/max by the thumbs
        onChange={handleSliderChange} // Internal handler for slider changes
        trackStyle={[
          {
            background: "linear-gradient(to right, #6AC91D, #FF6F00)",
            height: "6px",
            borderRadius: "3px",
          },
        ]}
        handleStyle={[
          {
            borderColor: "#6AC91D",
            backgroundColor: "#fff",
            boxShadow: "0 0 0 2px #6AC91D",
            width: "24px",
            height: "24px",
            marginTop: "-9px",
            opacity: 1,
            cursor: "grab",
          },
          {
            borderColor: "#FF6F00",
            backgroundColor: "#fff",
            boxShadow: "0 0 0 2px #FF6F00",
            width: "24px",
            height: "24px",
            marginTop: "-9px",
            opacity: 1,
            cursor: "grab",
          },
        ]}
        railStyle={{
          backgroundColor: "#2E2E38",
          height: "6px",
          borderRadius: "3px",
        }}
        dotStyle={{ display: "none" }}
        activeDotStyle={{ display: "none" }}
        className="mb-4"
      />
      {/* Numerical input fields (currently hidden) */}
      <div className="flex space-x-2 mt-4" style={{ display: "none" }}>
        <input
          type="number"
          value={currentSliderRange[0].toFixed(2)}
          onChange={handleMinPriceInputChange}
          onBlur={() => handleSliderChange(currentSliderRange)} // Trigger update on blur
          min={initialMin}
          max={initialMax}
          step="0.01"
          className="w-1/2 px-3 py-1 border border-gray-300 rounded-md text-sm"
        />
        <input
          type="number"
          value={currentSliderRange[1].toFixed(2)}
          onChange={handleMaxPriceInputChange}
          onBlur={() => handleSliderChange(currentSliderRange)} // Trigger update on blur
          min={initialMin}
          max={initialMax}
          step="0.01"
          className="w-1/2 px-3 py-1 border border-gray-300 rounded-md text-sm"
        />
      </div>
    </div>
  );
};

export default PriceFilter;
