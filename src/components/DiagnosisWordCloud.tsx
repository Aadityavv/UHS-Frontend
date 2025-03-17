import React, { useEffect, useState } from "react";
import WordCloud from "react-wordcloud";
import axios from "axios";
import { motion } from "framer-motion";
import Skeleton from "@mui/material/Skeleton";
import "tippy.js/dist/tippy.css";
import "tippy.js/animations/scale.css";

// Optional: Add toast or notification system if needed (based on your setup)

const DiagnosisWordCloud: React.FC = () => {
  const [diagnosis, setDiagnosis] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch diagnosis data
  const fetchDiagnosis = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setError("Unauthorized. Token missing.");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        "https://uhs-backend.onrender.com/api/diagnosis/frequencies",
      );

      if (response.status === 200) {
        setDiagnosis(response.data);
      } else {
        setError(response.data.message || "Failed to fetch diagnosis data.");
      }
    } catch (err: any) {
      console.error("Error fetching diagnosis data:", err);
      setError(err.message || "Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosis();
    const interval = setInterval(fetchDiagnosis, 30000); // Auto-refresh every 30 secs
    return () => clearInterval(interval);
  }, []);

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

  const customOptions = {
    rotations: 0,
    fontSizes: [14, 80] as [number, number],
    fontFamily: "Poppins, sans-serif",
    deterministic: true,
    enableTooltip: true,
    scale: "sqrt" as const,
    transitionDuration: 2500,
    colors: colorPalette,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative w-full flex justify-center items-center py-8"
    >
      <div className="relative w-full max-w-5xl bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-gray-100 p-8 transition-all duration-500">
        <h3 className="text-2xl font-bold text-gray-800 mb-8 text-center tracking-wide">
          Diagnosis Word Cloud
        </h3>

        {loading ? (
          <div className="flex justify-center items-center h-[400px]">
            <Skeleton
              variant="rectangular"
              width={"100%"}
              height={400}
              sx={{ borderRadius: "1rem" }}
            />
          </div>
        ) : error ? (
          <div className="text-center text-red-600 font-medium">{error}</div>
        ) : words.length === 0 ? (
          <div className="text-center text-gray-500 italic">
            No diagnosis data available yet.
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </motion.div>
  );
};

export default DiagnosisWordCloud;
