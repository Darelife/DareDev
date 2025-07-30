/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: "none",
            color: "#d1d5db",
            h1: {
              color: "#f87171",
              fontSize: "2.5rem",
              fontWeight: "700",
              marginBottom: "1rem",
              marginTop: "2rem",
            },
            h2: {
              color: "#f87171",
              fontSize: "2rem",
              fontWeight: "600",
              marginBottom: "0.75rem",
              marginTop: "1.5rem",
            },
            h3: {
              color: "#f87171",
              fontSize: "1.5rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
              marginTop: "1.25rem",
            },
            h4: {
              color: "#f87171",
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
              marginTop: "1rem",
            },
            p: {
              color: "#d1d5db",
              lineHeight: "1.75",
              marginBottom: "1rem",
            },
            a: {
              color: "#f87171",
              textDecoration: "none",
              "&:hover": {
                color: "#fca5a5",
                textDecoration: "underline",
              },
            },
            strong: {
              color: "#ffffff",
              fontWeight: "600",
            },
            em: {
              color: "#e5e7eb",
              fontStyle: "italic",
            },
            code: {
              color: "#fca5a5",
              backgroundColor: "#1f2937",
              padding: "0.25rem 0.5rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              fontWeight: "500",
            },
            pre: {
              backgroundColor: "#1f2937",
              color: "#d1d5db",
              padding: "1rem",
              borderRadius: "0.5rem",
              overflow: "auto",
              border: "1px solid #374151",
            },
            "pre code": {
              backgroundColor: "transparent",
              color: "inherit",
              padding: "0",
              borderRadius: "0",
            },
            blockquote: {
              borderLeftColor: "#ef4444",
              borderLeftWidth: "4px",
              backgroundColor: "#1f2937",
              color: "#d1d5db",
              fontStyle: "italic",
              padding: "1rem",
              margin: "1.5rem 0",
              borderRadius: "0 0.375rem 0.375rem 0",
            },
            ul: {
              color: "#d1d5db",
              paddingLeft: "1.5rem",
            },
            ol: {
              color: "#d1d5db",
              paddingLeft: "1.5rem",
            },
            li: {
              color: "#d1d5db",
              marginBottom: "0.5rem",
            },
            "li::marker": {
              color: "#f87171",
            },
            table: {
              width: "100%",
              borderCollapse: "collapse",
              margin: "1.5rem 0",
            },
            thead: {
              backgroundColor: "#1f2937",
            },
            th: {
              color: "#f87171",
              fontWeight: "600",
              padding: "0.75rem",
              textAlign: "left",
              borderBottom: "2px solid #374151",
            },
            td: {
              color: "#d1d5db",
              padding: "0.75rem",
              borderBottom: "1px solid #374151",
            },
            hr: {
              borderColor: "#374151",
              margin: "2rem 0",
            },
          },
        },
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
