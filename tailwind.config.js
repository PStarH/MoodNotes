module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#D3C9A6',
        'primary-contrast': '#7D5A36',
        text: '#4E3B2B',
        surface: '#FAF3E0',
        background: '#F0E9D2',
        destructive: '#FF4D4D',
        success: '#A8D8B9',
        alert: '#FBBE76',
      },
    },
  },
  plugins: [],
}
