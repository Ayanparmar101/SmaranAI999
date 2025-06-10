import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    }
  },
  plugins: [
    react(),
    mode === "production" &&
      visualizer({
        open: true,
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Optimize build output
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console logs in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 2 // Multiple passes for better compression
      },
      mangle: {
        safari10: true
      }
    },

    // Disable source maps for smaller builds
    sourcemap: false,

    rollupOptions: {
      output: {
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],

          // Firebase services (split more granularly)
          'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],

          // PDF processing (very large - keep separate)
          'pdf-vendor': ['pdfjs-dist'],

          // UI component library (expanded)
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-accordion',
            '@radix-ui/react-progress',
            '@radix-ui/react-avatar',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-label',
            '@radix-ui/react-popover',
            '@radix-ui/react-slider',
            '@radix-ui/react-switch',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],

          // Chart libraries
          'chart-vendor': ['recharts', 'd3-scale', 'd3-shape', 'd3-array'],

          // Date and utility libraries
          'utils-vendor': ['date-fns', 'clsx', 'tailwind-merge', 'class-variance-authority'],

          // Math rendering
          'math-vendor': ['katex'],

          // Feature chunks
          'flashcards': [
            'src/pages/FlashcardGeneratorPage.tsx',
            'src/components/flashcards/FlashcardViewer.tsx',
            'src/components/flashcards/FlashcardEditor.tsx',
            'src/components/flashcards/FlashcardExamMode.tsx',
            'src/components/flashcards/ExamHistoryViewer.tsx',
            'src/components/flashcards/PDFUpload.tsx',
            'src/services/flashcardService.ts'
          ],
          'study-planner': [
            'src/pages/StudyPlannerPage.tsx',
            'src/pages/ScienceStudyPlannerPage.tsx',
            'src/pages/SocialScienceStudyPlannerPage.tsx',
            'src/pages/HindiStudyPlannerPage.tsx',
            'src/pages/GujaratiStudyPlannerPage.tsx'
          ],
          'subjects': [
            'src/pages/SciencePage.tsx',
            'src/pages/SocialSciencePage.tsx',
            'src/pages/HindiPage.tsx',
            'src/pages/GujaratiPage.tsx',
            'src/pages/MathematicsPage.tsx'
          ],
          'chatbots': [
            'src/pages/ScienceChatbotPage.tsx',
            'src/pages/SocialScienceChatbotPage.tsx',
            'src/pages/HindiChatbotPage.tsx',
            'src/pages/GujaratiChatbotPage.tsx'
          ],
          'teachers': [
            'src/pages/TeacherPage.tsx',
            'src/pages/ScienceTeacherPage.tsx',
            'src/pages/SocialScienceTeacherPage.tsx',
            'src/pages/HindiTeacherPage.tsx',
            'src/pages/GujaratiTeacherPage.tsx',
            'src/pages/MathematicsTeacherPage.tsx'
          ]
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage'
    ],
    exclude: [
      'pdfjs-dist' // Large library, load on demand
    ]
  }
}));

