import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				/* Legacy compatibility */
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					hover: 'hsl(var(--primary-hover))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))',
					hover: 'hsl(var(--secondary-hover))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				
				/* Trauma-Informed Design System */
				'bg-primary': 'hsl(var(--bg-primary))',
				'bg-secondary': 'hsl(var(--bg-secondary))',
				'bg-tertiary': 'hsl(var(--bg-tertiary))',
				'bg-elevated': 'hsl(var(--bg-elevated))',
				
				'text-primary': 'hsl(var(--text-primary))',
				'text-secondary': 'hsl(var(--text-secondary))',
				'text-muted': 'hsl(var(--text-muted))',
				'text-light': 'hsl(var(--text-light))',
				
				'gentle-teal': 'hsl(var(--gentle-teal))',
				'soft-sage': 'hsl(var(--soft-sage))',
				'soft-lavender': 'hsl(var(--soft-lavender))',
				'primary-navy': 'hsl(var(--primary-navy))',
				
				'btn-primary': {
					DEFAULT: 'hsl(var(--btn-primary))',
					hover: 'hsl(var(--btn-primary-hover))',
					active: 'hsl(var(--btn-primary-active))',
					foreground: 'hsl(var(--btn-primary-text))'
				},
				'btn-secondary': {
					DEFAULT: 'hsl(var(--btn-secondary))',
					hover: 'hsl(var(--btn-secondary-hover))',
					active: 'hsl(var(--btn-secondary-active))',
					foreground: 'hsl(var(--btn-secondary-text))'
				},
				'btn-gentle': {
					DEFAULT: 'hsl(var(--btn-gentle))',
					hover: 'hsl(var(--btn-gentle-hover))',
					active: 'hsl(var(--btn-gentle-active))',
					foreground: 'hsl(var(--btn-gentle-text))'
				},
				
				'input-border': 'hsl(var(--input-border))',
				'input-border-focus': 'hsl(var(--input-border-focus))',
				'input-border-error': 'hsl(var(--input-border-error))',
				'input-background': 'hsl(var(--input-background))',
				'input-background-disabled': 'hsl(var(--input-background-disabled))',
				
				evidence: {
					low: 'hsl(var(--evidence-low))',
					medium: 'hsl(var(--evidence-medium))',
					high: 'hsl(var(--evidence-high))'
				},
				
				/* Neutral palette for consistent grays */
				neutral: {
					50: 'hsl(var(--neutral-50))',
					100: 'hsl(var(--neutral-100))',
					200: 'hsl(var(--neutral-200))',
					300: 'hsl(var(--neutral-300))',
					400: 'hsl(var(--neutral-400))',
					500: 'hsl(var(--neutral-500))',
					600: 'hsl(var(--neutral-600))',
					700: 'hsl(var(--neutral-700))',
					800: 'hsl(var(--neutral-800))',
					900: 'hsl(var(--neutral-900))'
				},
				
				status: {
					success: 'hsl(var(--status-success))',
					warning: 'hsl(var(--status-warning))',
					error: 'hsl(var(--status-error))',
					info: 'hsl(var(--status-info))',
					new: 'hsl(var(--status-new))',
					investigating: 'hsl(var(--status-investigating))',
					resolved: 'hsl(var(--status-resolved))'
				},
				
				/* Legacy status colors for compatibility */
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))',
					muted: 'hsl(var(--success-muted))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))',
					muted: 'hsl(var(--warning-muted))'
				}
			},
			backgroundImage: {
				'gradient-primary': 'var(--gradient-primary)',
				'gradient-secondary': 'var(--gradient-secondary)',
				'gradient-hero': 'var(--gradient-hero)',
				'gradient-subtle': 'var(--gradient-subtle)'
			},
			boxShadow: {
				'sm': 'var(--shadow-sm)',
				'md': 'var(--shadow-md)',
				'lg': 'var(--shadow-lg)',
				'xl': 'var(--shadow-xl)',
				'glow': 'var(--shadow-glow)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			transitionTimingFunction: {
				'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
				'bounce': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;