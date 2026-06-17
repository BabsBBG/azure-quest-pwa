import animate from "tailwindcss-animate";
var config = {
    darkMode: ["class"],
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            borderRadius: {
                xl: "1.25rem",
                "2xl": "1.5rem"
            },
            boxShadow: {
                glow: "0 0 28px rgba(5,150,105,0.22)",
                card: "0 18px 44px rgba(6,78,59,0.14)"
            },
            keyframes: {
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-7px)" }
                },
                pop: {
                    "0%": { transform: "scale(.96)" },
                    "100%": { transform: "scale(1)" }
                }
            },
            animation: {
                float: "float 3s ease-in-out infinite",
                pop: "pop 160ms ease-out"
            }
        }
    },
    plugins: [animate]
};
export default config;
