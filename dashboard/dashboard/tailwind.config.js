module.exports = {
  theme: {
    extend: {
      keyframes: {
        pulseSlow: {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.02)", opacity: "0.95" },
        },
        sparkle: {
          "0%": { transform: "translateY(0) scale(1)", opacity: "1" },
          "50%": { transform: "translateY(-5px) scale(1.2)", opacity: "0.6" },
          "100%": { transform: "translateY(0) scale(1)", opacity: "1" },
        },
        glow: {
          "0%,100%": { filter: "drop-shadow(0 0 2px #6366f1)" },
          "50%": { filter: "drop-shadow(0 0 6px #3b82f6)" },
        },
      },
      animation: {
        "pulse-slow": "pulseSlow 3s ease-in-out infinite",
        sparkle: "sparkle 2s ease-in-out infinite",
        glow: "glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
