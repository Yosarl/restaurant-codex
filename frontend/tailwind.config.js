/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef9f7',
          100: '#d4f1eb',
          500: '#0f766e',
          700: '#115e59',
          900: '#134e4a'
        }
      },
      boxShadow: {
        tile: '0 4px 24px rgba(17, 94, 89, 0.18)'
      }
    }
  },
  plugins: []
};
