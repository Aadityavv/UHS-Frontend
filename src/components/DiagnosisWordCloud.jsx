import React from "react";
import WordCloud from "react-wordcloud";

// CSS for tooltips and animations
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

const DiagnosisWordCloud = ({ diagnosis }) => {
  // Convert the diagnosis object to an array of { text, value }
  const words = Object.entries(diagnosis).map(([text, value]) => ({
    text,
    value,
  }));

  // Find min and max frequencies to normalize font size calculation
  const frequencies = Object.values(diagnosis);
  const minFrequency = Math.min(...frequencies);
  const maxFrequency = Math.max(...frequencies);

  // Function to calculate font size based on raw frequencies (you can adjust the factor)
  const calculateFontSize = (value) => {
    const minFontSize = 14;
    const maxFontSize = 80;

    // If all frequencies are the same, return mid-size
    if (minFrequency === maxFrequency) return (minFontSize + maxFontSize) / 2;

    // Linear interpolation
    return (
      minFontSize +
      ((value - minFrequency) / (maxFrequency - minFrequency)) *
        (maxFontSize - minFontSize)
    );
  };

  const customOptions = {
    rotations: 0, // static rotation for better readability
    fontSizes: [14, 80], // fallback if no scale function used
    fontFamily: "Poppins, sans-serif",
    deterministic: true,
    enableTooltip: true,
    scale: "sqrt", // scale font sizes better
    transitionDuration: 5000,
    // Colors are randomized from this palette
    colors: [
      "#4f46e5", // Indigo
      "#2563eb", // Blue
      "#16a34a", // Green
      "#d97706", // Amber
      "#dc2626", // Red
      "#9333ea", // Purple
    ],
  };

  // Custom callbacks for tooltip
  const callbacks = {
    getWordTooltip: (word) =>
      `Diagnosis: ${word.text}\nPrescribed: ${word.value} times`,
    getWordColor: (word) => {
      const colorPalette = [
        "#4f46e5", // Indigo
        "#2563eb", // Blue
        "#16a34a", // Green
        "#d97706", // Amber
        "#dc2626", // Red
        "#9333ea", // Purple
      ];
      return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    },
    getWordFontSize: (word) => calculateFontSize(word.value),
  };

  return (
    <div className="relative w-full flex justify-center items-center py-8">
      <div className="relative w-full max-w-5xl bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 p-8 transition-all duration-500">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center tracking-wide">
          Diagnosis Word Cloud
        </h3>

        <div
          className="w-full h-[400px] cursor-pointer"
          style={{
            background:
              "linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0))",
            borderRadius: "1rem",
            padding: "1rem",
          }}
        >
          <WordCloud
            words={words}
            options={customOptions}
            callbacks={callbacks}
          />
        </div>

        <div className="text-sm text-gray-500 italic text-center mt-4">
          Hover to see frequency • Size shows diagnosis frequency
        </div>
      </div>
    </div>
  );
};

export default DiagnosisWordCloud;
