/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'primary-bg': 'var(--primary-bg)',
        'secondary-bg': 'var(--secondary-bg)',
        'text-primary': 'var(--text-primary)',
        'highlight': 'var(--highlight)',
        'correct': 'var(--correct)',
        'wrong': 'var(--wrong)',
        'border-subtle': 'var(--border-subtle)',
        'button-bg': 'var(--button-bg)',
        'button-hover': 'var(--button-hover)',
        'border-error': 'var(--wrong)'
      },
      fontFamily: {
        'mono': ['"Roboto Mono"', 'monospace']
      }
    },
  },
  safelist: [
    'bg-primary-bg',
    'bg-secondary-bg',
    'text-text-primary',
    'border-border-subtle',
    'bg-button-bg',
    'hover:bg-button-hover',
    'border-border-error'
  ],
  plugins: [],
}