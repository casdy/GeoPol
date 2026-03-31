import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: "class",
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        screens: {
            'xs': '380px',
            'sm': '640px',
            'md': '768px',
            'lg': '1024px',
            'xl': '1280px',
            '2xl': '1536px',
        },
        extend: {
            colors: {
                slate: {
                    950: '#020617', // Deep background
                }
            },
            fontFamily: {
                sans: ['var(--font-ui)', 'sans-serif'],
                serif: ['var(--font-reading)', 'serif'],
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
export default config;
