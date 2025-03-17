import React from "react";
import WordCloud from "react-wordcloud";

// CSS for tooltips and animations
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

// Define the type for diagnosis prop
interface DiagnosisWordCloudProps {
  diagnosis: Record<string, number>;
}

const DiagnosisWordCloud: React.FC<DiagnosisWordCloudProps> = ({ diagnosis }) => {
  // Convert the diagnosis object to an array of { text, value }
  const words = Object.entries(diagnosis).map(([text, value]) => ({
    text,
    value,
  }));

  const frequencies = Object.values(diagnosis);
  const minFrequency = Math.min(...frequencies);
  const maxFrequency = Math.max(...frequencies);

  const calculateFontSize = (value: number): number => {
    const minFontSize = 14;
    const maxFontSize = 80;

    if (minFrequency === maxFrequency) return (minFontSize + maxFontSize) / 2;

    return (
      minFontSize +
      ((value - minFrequency) / (maxFrequency - minFrequency)) *
        (maxFontSize - minFontSize)
    );
  };

  const colorPalette: string[] = [
    "#4f46e5", // Indigo
    "#2563eb", // Blue
    "#16a34a", // Green
    "#d97706", // Amber
    "#dc2626", // Red
    "#9333ea", // Purple
    "#0ea5e9", // Sky
    "#14b8a6", // Teal
    "#a855f7", // Violet
    "#e11d48", // Rose
  ];

  // Custom callbacks (typed manually since the library lacks types)
  const callbacks = {
    getWordTooltip: (word: { text: string; value: number }) =>
      `Diagnosis: ${word.text}\nPrescribed: ${word.value} times`,

    getWordColor: () => {
      const index = Math.floor(Math.random() * colorPalette.length);
      return colorPalette[index];
    },

    getWordFontSize: (word: { text: string; value: number }) =>
      calculateFontSize(word.value),
  };

  // Options for react-wordcloud (manually typed)
  const customOptions = {
    rotations: 0,
    fontSizes: [14, 80] as [number, number],
    fontFamily: "Poppins, sans-serif",
    deterministic: true,
    enableTooltip: true,
    scale: "sqrt" as const,
    transitionDuration: 500,
    colors: colorPalette,
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
