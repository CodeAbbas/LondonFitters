tailwind.config = {
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Space Grotesk', 'sans-serif'],
            },
            colors: {
                brand: {
                    500: '#2563EB', // Royal Blue
                    600: '#1D4ED8',
                    900: '#0F172A', // Slate 900
                },
                blueprint: '#1e293b',
            },
            animation: {
                'draw': 'draw 2s cubic-bezier(0.4, 0, 0.2, 1) forwards',
                'fade-in': 'fadeIn 0.3s ease-out forwards',
                'slide-up': 'slideUp 0.6s ease-out forwards',
                'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                draw: {
                    '0%': { strokeDasharray: '0, 1000' },
                    '100%': { strokeDasharray: '1000, 0' },
                },
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                }
            }
        }
    }
}