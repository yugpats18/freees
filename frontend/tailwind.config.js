module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#213448',      // Dark blue - main color
        secondary: '#BF4646',    // Red - accent color
        accent: '#94B4C1',       // Light blue - secondary accent
        light: '#EAE0CF',        // Cream - backgrounds
        danger: '#BF4646',
        warning: '#F59E0B',
        success: '#10B981',
      }
    },
  },
  plugins: [],
}
