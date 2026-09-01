/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cat: {
          yellow: "#FFCD11",      // Official Caterpillar Yellow
          gold: "#E5B300",        // Rich Gold
          amber: "#B45309",       // High-contrast readable Amber
          black: "#111827",       // Heavy Industrial Black
          charcoal: "#1F2937",    // Deep Charcoal
          slate: "#334155",       // Slate text
          muted: "#475569",       // Secondary readable text (darker than 400 for high readability)
          light: "#F8FAFC",       // Clean light background
          card: "#FFFFFF",        // Crisp white card
          border: "#CBD5E1",      // Defined slate border
          accent: "#D97706"
        }
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(0, 0, 0, 0.05), 0 1px 3px -1px rgba(0, 0, 0, 0.03)',
        'soft-md': '0 4px 20px -4px rgba(0, 0, 0, 0.08), 0 2px 6px -2px rgba(0, 0, 0, 0.04)',
        'soft-lg': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'cat-glow': '0 0 18px -2px rgba(255, 205, 17, 0.45)',
      }
    },
  },
  plugins: [],
}
