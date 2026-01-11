/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
    "./error.vue"
  ],
  theme: {
    extend: {
      colors: {
        // Notebook paper colors
        'notebook': {
          'paper': '#fdf8e8',      // Soft beige/off-white
          'paper-dark': '#f5edd6', // Slightly darker for hover
          'lines': '#a8d4f0',      // Blue horizontal lines
          'margin': '#e88b8b',     // Red margin line
          'ink': '#2c3e50',        // Dark ink for text
          'ink-light': '#5a6c7d',  // Lighter ink for secondary text
        },
        // Accent colors with handwritten feel
        'pen': {
          'blue': '#1e5799',       // Blue pen
          'red': '#c0392b',        // Red pen
          'green': '#27ae60',      // Green pen (for done)
          'gray': '#7f8c8d',       // Pencil gray
        }
      },
      fontFamily: {
        'handwritten': ['"Patrick Hand"', 'cursive'],
        'handwritten-alt': ['"Caveat"', 'cursive'],
        'typewriter': ['"Courier Prime"', 'monospace'],
      },
      boxShadow: {
        'notebook': '2px 2px 0 rgba(0, 0, 0, 0.1)',
        'notebook-hover': '3px 3px 0 rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        'sketchy': '255px 15px 225px 15px/15px 225px 15px 255px',
      },
      animation: {
        'wobble': 'wobble 0.3s ease-in-out',
        'pulse-soft': 'pulse-soft 2s infinite',
      },
      keyframes: {
        wobble: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(-1deg)' },
          '75%': { transform: 'rotate(1deg)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}