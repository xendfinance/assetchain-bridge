module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary-card': '#0B131E',
        'primary-btn': '#2042B8',
        'primary-bg': '#070E17',
        'primary-text': '#FFFFFF',
        'primary-icon': '#505050',
        'primary-popup': '#121D2D',
        'primary-border': '#1E2643',
        'label-text': '#A3A8BB',
        'success': '#219D2E',
        'error-icon': '#BC1409',
        'error': '#EB5757',
        'primary-border-card': 'rgba(228,228,231,0.15)',
        'select-drop': '#121d2d',
        'disabled-text': '#5F667E'

      },
    },
    fontFamily: {
      // raleway: ['Raleway'],
      syne: ['Syne'],
    },
  },
  plugins: [],
}
