/** @type {import('tailwindcss').Config} */
module.exports = {
    // NOTE: Configure the content paths to include all your components
    content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
    presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                ezriya: {
                    black: "#050510", // Deep Black Background
                    blue: "#2F5CFF", // Electric Blue
                    "blue-dark": "#0A1F5C", // Deep Blue for gradients
                    "blue-light": "#6689FF", // Lighter blue for accents
                    glass: "rgba(255, 255, 255, 0.05)", // Base glass opacity
                    "glass-border": "rgba(255, 255, 255, 0.1)", // Border for glass cards
                    "glass-text": "rgba(255, 255, 255, 0.7)", // Muted text on glass
                }
            },
        },
    },
    plugins: [],
}
