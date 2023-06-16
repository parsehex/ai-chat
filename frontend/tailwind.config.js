/** @type {import('tailwindcss').Config} */
module.exports = {
	purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	darkMode: 'media', // This enables dark mode support
	theme: {
		extend: {
			colors: {
				background: '#ffffff',
				'background-soft': '#f8f8f8',
				'background-mute': '#f2f2f2',
				border: 'rgba(60, 60, 60, 0.12)',
				'border-hover': 'rgba(60, 60, 60, 0.29)',
				heading: '#2c3e50',
				text: '#2c3e50',
			},
			fontFamily: {
				sans: [
					'Inter',
					'-apple-system',
					'BlinkMacSystemFont',
					'Segoe UI',
					'Roboto',
					'Oxygen',
					'Ubuntu',
					'Cantarell',
					'Fira Sans',
					'Droid Sans',
					'Helvetica Neue',
					'sans-serif',
				],
			},
		},
	},
	variants: {
		extend: {},
	},
	plugins: [],
};
