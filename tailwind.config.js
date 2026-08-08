/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          dark: '#0a0f1d',     // Deep dark navy
          card: '#131c31',     // Slate card navy
          border: '#1e294b',   // Border slate
          primary: '#3b82f6',  // Blue 500
          primaryLight: '#60a5fa', // Blue 400
          secondary: '#10b981', // Emerald 500
          secondaryLight: '#34d399', // Emerald 400
          success: '#10b981',  // Emerald 500
          warning: '#f59e0b',  // Amber 500
          danger: '#ef4444',   // Red 500
          text: '#f8fafc',     // Slate 50
          muted: '#64748b',    // Slate 500
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(59, 130, 246, 0.4)',
        'glow-success': '0 0 15px rgba(16, 185, 129, 0.4)',
        'glow-warning': '0 0 15px rgba(245, 158, 11, 0.4)',
        'glow-danger': '0 0 15px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}
