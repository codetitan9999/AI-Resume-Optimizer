import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./hooks/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
    "./store/**/*.{ts,tsx}",
    "./utils/**/*.{ts,tsx}"
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))"
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))"
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))"
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))"
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))"
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
      },
      boxShadow: {
        soft: "0 10px 25px -15px rgba(15, 23, 42, 0.35)",
        glow: "0 0 0 1px rgba(14, 116, 144, 0.25), 0 18px 40px -20px rgba(14, 116, 144, 0.55)"
      },
      keyframes: {
        enter: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseRing: {
          "0%": { transform: "scale(0.9)", opacity: "0.8" },
          "100%": { transform: "scale(1.1)", opacity: "0" }
        }
      },
      animation: {
        enter: "enter 400ms ease-out",
        pulseRing: "pulseRing 1.4s ease-out infinite"
      },
      backgroundImage: {
        "mesh-light": "radial-gradient(circle at 10% 20%, rgba(22, 78, 99, 0.16), transparent 40%), radial-gradient(circle at 80% 0%, rgba(15, 118, 110, 0.14), transparent 35%), radial-gradient(circle at 50% 100%, rgba(8, 47, 73, 0.14), transparent 45%)",
        "mesh-dark": "radial-gradient(circle at 10% 20%, rgba(45, 212, 191, 0.13), transparent 40%), radial-gradient(circle at 80% 0%, rgba(56, 189, 248, 0.12), transparent 35%), radial-gradient(circle at 50% 100%, rgba(14, 116, 144, 0.16), transparent 45%)"
      }
    }
  },
  plugins: []
};

export default config;
