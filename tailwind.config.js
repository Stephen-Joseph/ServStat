/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Server type colors
    'bg-green-500/20', 'text-green-400', 'border-green-500/50', 'shadow-green-500/10',
    'bg-blue-500/20', 'text-blue-400', 'border-blue-500/50', 'shadow-blue-500/10',
    'bg-orange-500/20', 'text-orange-400', 'border-orange-500/50', 'shadow-orange-500/10',
    'bg-green-600', 'border-green-500',
    'bg-blue-600', 'border-blue-500',
    'bg-orange-600', 'border-orange-500',
    'hover:bg-green-500/10',
    'hover:bg-blue-500/10',
    'hover:bg-orange-500/10',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
