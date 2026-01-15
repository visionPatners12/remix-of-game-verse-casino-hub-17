import { defineConfig, type PluginOption } from "vite";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig(({ mode }) => {
  // Désactiver PWA en mode development pour éviter l'erreur ox/erc8010
  const isPWAEnabled = mode === 'production';
  
  const plugins: PluginOption[] = [react()];
  
  if (isPWAEnabled) {
    plugins.push(
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'icons/*.png', 'offline.html'],
        manifest: {
          name: 'Pryzen Game',
          short_name: 'Pryzen',
          description: 'Crypto multiplayer games & on-chain betting. Play Ludo with friends, win USDC.',
          theme_color: '#0f0f1a',
          background_color: '#0f0f1a',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          lang: 'en',
          categories: ['games', 'entertainment', 'finance'],
          icons: [
            {
              src: '/icons/icon-72x72.png',
              sizes: '72x72',
              type: 'image/png'
            },
            {
              src: '/icons/icon-96x96.png',
              sizes: '96x96',
              type: 'image/png'
            },
            {
              src: '/icons/icon-128x128.png',
              sizes: '128x128',
              type: 'image/png'
            },
            {
              src: '/icons/icon-144x144.png',
              sizes: '144x144',
              type: 'image/png'
            },
            {
              src: '/icons/icon-152x152.png',
              sizes: '152x152',
              type: 'image/png'
            },
            {
              src: '/icons/icon-180x180.png',
              sizes: '180x180',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icons/icon-384x384.png',
              sizes: '384x384',
              type: 'image/png'
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icons/maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable'
            }
          ],
          shortcuts: [
            {
              name: 'Play Ludo',
              short_name: 'Ludo',
              url: '/games/ludo/create',
              icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
            },
            {
              name: 'My Wallet',
              short_name: 'Wallet',
              url: '/wallet',
              icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
            },
            {
              name: 'Games',
              short_name: 'Games',
              url: '/games',
              icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }]
            }
          ],
          // Deep linking: handle shared URLs
          share_target: {
            action: '/share-target',
            method: 'GET',
            params: {
              url: 'url',
              text: 'text',
              title: 'title'
            }
          },
          // Protocol handlers for pryzen:// links
          protocol_handlers: [
            {
              protocol: 'web+pryzen',
              url: '/protocol-handler?url=%s'
            }
          ],
          // Deep linking: PWA should handle all URLs from this origin
          launch_handler: {
            client_mode: ["navigate-existing", "auto"]
          },
          handle_links: "preferred"
        } as any,
        workbox: {
          // Précacher l'essentiel + vendors JS critiques pour offline
          globPatterns: [
            '**/*.{html,css,ico,woff2,woff,ttf}',
            '**/react-vendor*.js',
            '**/ui-vendor*.js',
            '**/icons-vendor*.js',
            // Assets critiques pour le jeu
            'ludo-logo.png',
            'pryzen-logo.png',
          ],
          globIgnores: [
            '**/Token*.js',
            '**/Network*.js',
            '**/arrow-*.js',
            '**/chevron-*.js',
            '**/cursor-*.js',
            '**/close-*.js',
            '**/search-*.js',
            '**/checkmark-*.js'
          ],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10 MB
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/, /^\/supabase/],
          runtimeCaching: [
            // Google Fonts stylesheets
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                }
              }
            },
            // Google Fonts webfonts
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: {
                  maxEntries: 30,
                  maxAgeSeconds: 60 * 60 * 24 * 365
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Images statiques - cache augmenté
            {
              urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'images-cache',
                expiration: {
                  maxEntries: 200, // Augmenté de 100
                  maxAgeSeconds: 60 * 60 * 24 * 60 // 60 jours (était 30)
                }
              }
            },
            // Supabase REST API - StaleWhileRevalidate pour économiser data
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(?!rpc\/).*/i,
              handler: 'StaleWhileRevalidate', // Était NetworkFirst
              options: {
                cacheName: 'supabase-api-cache',
                expiration: {
                  maxEntries: 100, // Augmenté de 50
                  maxAgeSeconds: 60 * 10 // 10 minutes (était 5)
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Supabase données statiques (leagues, teams, sports) - CacheFirst
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/(leagues|teams|sports|countries)/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'supabase-static-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 // 24 heures
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Supabase RPC functions - cache court
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/rpc\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'supabase-rpc-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 5 // 5 minutes
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // Supabase Storage - cache long
            {
              urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'supabase-storage-cache',
                expiration: {
                  maxEntries: 200, // Augmenté de 100
                  maxAgeSeconds: 60 * 60 * 24 * 30 // 30 jours (était 7)
                }
              }
            },
            // GetStream API (feed, chat)
            {
              urlPattern: /^https:\/\/.*\.stream-io-api\.com\/.*/i,
              handler: 'NetworkFirst',
              options: {
                cacheName: 'stream-api-cache',
                expiration: {
                  maxEntries: 100,
                  maxAgeSeconds: 60 * 10
                },
                networkTimeoutSeconds: 5,
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // GetStream CDN (images, avatars)
            {
              urlPattern: /^https:\/\/getstream\.imgix\.net\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'stream-images-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 30
                },
                cacheableResponse: {
                  statuses: [0, 200]
                }
              }
            },
            // JS files à la demande (pas en precache)
            {
              urlPattern: /\.js$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'js-runtime-cache',
                expiration: {
                  maxEntries: 200,
                  maxAgeSeconds: 60 * 60 * 24 * 7
                }
              }
            }
          ]
        }
      })
    );
  }

  return {
    server: {
      host: true,
      port: 8080,
    },
    plugins,
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "lucide-react", "@radix-ui/react-icons", "viem"]
    },
    define: {
      global: 'globalThis',
    },
    build: {
      target: 'es2020',
      rollupOptions: {
        maxParallelFileOps: 1,
        treeshake: true,
        onwarn(warning, warn) {
          if ((warning as any).code === 'INVALID_ANNOTATION') return;
          // Ignore ox-related warnings
          if (warning.message?.includes('ox')) return;
          warn(warning);
        },
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'web3-vendor': ['wagmi', 'viem', 'ethers'],
            'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-toast'],
            'icons-vendor': ['lucide-react'],
            // Nouveaux chunks pour optimisation
            'animation-vendor': ['framer-motion'],
            'game-vendor': ['konva', 'react-konva'],
            'query-vendor': ['@tanstack/react-query'],
          }
        }
      },
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react/jsx-runtime',
        'wagmi',
        'viem',
      ],
      exclude: [
        '@web3icons/react',
      ],
    },
  };
});
