/** @type {import('tailwindcss').Config} */
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'hsl(210, 40%, 50%)',
        secondary: 'hsl(340, 30%, 45%)',
        accent: 'hsl(50, 80%, 55%)',
        background: 'hsl(210, 20%, 98%)',
        foreground: 'hsl(210, 30%, 20%)',
      },
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      
      dropShadow: {
        'emoji': '0 2px 1px rgba(0, 0, 0, 0.3)',
        'emoji-hover': '0 3px 2px rgba(0, 0, 0, 0.4)',
      },
      textShadow: {
        'default': '0 2px 0 rgba(0, 0, 0, 0.2)',
        'active': '0 3px 0 rgba(0, 0, 0, 0.2), 0 0 10px rgba(255, 50, 50, 0.5)',
      },
      colors: {
        'airbnb-red': '#FF385C',
        'airbnb-light-red': '#FFF1F2',
        'airbnb-dark': '#222222',
        'airbnb-gray': '#717171',
        'airbnb-medium-gray': '#DDDDDD',
        'airbnb-light-gray': '#F7F7F7',
        'airbnb-yellow': '#FFB400',
      },
      boxShadow: {
        'airbnb': '0 8px 28px rgba(0,0,0,0.08)',
        'green-sm': '0 2px 8px rgba(74, 222, 128, 0.2)',
        'red-sm': '0 2px 8px rgba(248, 113, 113, 0.2)'
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'pulse-slow': 'pulse 5s infinite',
        
      },
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
      },
      fontSize: {
        '2xs': '0.625rem',
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1rem',
        'lg': '1.125rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
      },
      lineHeight: {
        'tighter': 1.15,
        'relaxed': 1.7,
      },
    },
  },
  plugins: [
  
  ],
}