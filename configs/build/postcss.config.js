import { join } from 'path';

// Note: If you use library-specific PostCSS/Tailwind configuration then you should remove the `postcssConfig` build
// option from your application's configuration (i.e. project.json).

export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
