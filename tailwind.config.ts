import type { Config } from 'tailwindcss';
import daisyUi from 'daisyui';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyUi],
  daisyui: {
    themes: ["cupcake"]
  }
};

export default config;
