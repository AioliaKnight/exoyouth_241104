import { defineConfig, loadEnv, type UserConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import tsconfigPaths from 'vite-tsconfig-paths';
import compression from 'vite-plugin-compression';
import { visualizer } from 'rollup-plugin-visualizer';

// Environment variables type
type EnvType = {
  VITE_APP_NAME?: string;
  VITE_APP_SHORT_NAME?: string;
  VITE_APP_DESCRIPTION?: string;
  VITE_API_URL?: string;
  VITE_PORT?: string;
  VITE_API_TIMEOUT?: string;
  VITE_PREVIEW_PORT?: string;
  [key: string]: string | undefined;
};

export default defineConfig(({ mode }): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '') as unknown as EnvType;
  const isProd = mode === 'production';

  // Validate required environment variables
  const requiredEnvVars = [
    'VITE_API_URL',
    'VITE_APP_NAME',
    'VITE_APP_SHORT_NAME',
    'VITE_APP_DESCRIPTION'
  ] as const;

  requiredEnvVars.forEach(varName => {
    if (!env[varName]) {
      console.warn(`Warning: ${varName} is not defined in environment variables`);
    }
  });

  return {
    base: '/',
    
    plugins: [
      react({
        jsxRuntime: 'automatic',
        babel: {
          plugins: isProd ? ['transform-remove-console'] : []
        }
      }),
      tsconfigPaths(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: env.VITE_APP_NAME || 'ExoYouth',
          short_name: env.VITE_APP_SHORT_NAME || 'ExoYouth',
          description: env.VITE_APP_DESCRIPTION || '專業級外泌體保養品',
          theme_color: '#ffffff',
          background_color: '#ffffff',
          display: 'standalone',
          start_url: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any maskable'
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        workbox: {
          cleanupOutdatedCaches: true,
          skipWaiting: true,
          clientsClaim: true,
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/api\./i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 60 * 24
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            {
              urlPattern: /\.(png|jpg|jpeg|svg|gif)$/,
              handler: 'CacheFirst',
              options: {
                cacheName: 'image-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7
                }
              }
            }
          ],
          navigateFallback: 'index.html'
        }
      }),
      ...(isProd ? [
        compression({
          algorithm: 'gzip',
          ext: '.gz',
          filter: /\.(js|css|html|svg)$/,
          threshold: 10240
        }),
        compression({
          algorithm: 'brotliCompress',
          ext: '.br',
          filter: /\.(js|css|html|svg)$/,
          threshold: 10240
        }),
        visualizer({
          filename: 'stats.html',
          gzipSize: true,
          brotliSize: true
        })
      ] : [])
    ],

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '@components': resolve(__dirname, './src/components'),
        '@hooks': resolve(__dirname, './src/hooks'),
        '@pages': resolve(__dirname, './src/pages'),
        '@stores': resolve(__dirname, './src/stores'),
        '@utils': resolve(__dirname, './src/utils'),
        '@types': resolve(__dirname, './src/types'),
        '@assets': resolve(__dirname, './src/assets'),
        '@styles': resolve(__dirname, './src/styles'),
        '@services': resolve(__dirname, './src/services')
      }
    },

    css: {
      modules: {
        localsConvention: 'camelCaseOnly',
        generateScopedName: isProd ? '[hash:base64:8]' : '[name]__[local]'
      },
      devSourcemap: true,
      preprocessorOptions: {
        scss: {
          additionalData: '@import "@/styles/variables.scss";'
        }
      }
    },

    build: {
      target: ['esnext', 'chrome89', 'edge89', 'firefox89', 'safari15'],
      minify: 'esbuild',
      cssMinify: true,
      cssCodeSplit: true,
      sourcemap: !isProd,
      reportCompressedSize: false,
      chunkSizeWarningLimit: 1000,
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-core': ['react', 'react-dom'],
            'react-router': ['react-router-dom'],
            'react-hooks': [
              '@tanstack/react-query',
              'react-hook-form',
              'react-intersection-observer'
            ],
            'ui-core': [
              'lucide-react',
              'framer-motion'
            ],
            'ui-components': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip'
            ],
            'utils': [
              'zustand',
              'clsx',
              'tailwind-merge',
              'date-fns',
              'lodash-es',
              'zod'
            ]
          },
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: (assetInfo) => {
            if (!assetInfo?.name) return 'assets/[name].[hash][extname]';
            
            if (/\.(png|jpe?g|gif|svg|webp)$/.test(assetInfo.name)) {
              return 'assets/images/[name].[hash][extname]';
            }
            if (/\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
              return 'assets/fonts/[name].[hash][extname]';
            }
            return 'assets/[name].[hash][extname]';
          }
        }
      }
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        '@radix-ui/react-toast',
        'zustand',
        'clsx',
        'tailwind-merge',
        'framer-motion'
      ],
      exclude: ['@vite/client', '@vite/env']
    },

    server: {
      port: Number(env.VITE_PORT) || 3000,
      open: true,
      cors: true,
      proxy: env.VITE_API_URL ? {
        '/api': {
          target: env.VITE_API_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          secure: false,
          ws: true,
          timeout: Number(env.VITE_API_TIMEOUT) || 30000
        }
      } : undefined,
      hmr: {
        overlay: true
      }
    },

    preview: {
      port: Number(env.VITE_PREVIEW_PORT) || 5000,
      open: true,
      cors: true
    },

    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
      legalComments: 'none'
    }
  };
});