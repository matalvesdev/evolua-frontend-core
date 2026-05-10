import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import path from 'path'

// ── Security Headers ──────────────────────────────────────────────────────────
// Aplicados em dev (vite dev server). Em produção, configure no servidor/CDN
// (Vercel: vercel.json, Netlify: _headers, Nginx: add_header).
const SECURITY_HEADERS: Record<string, string> = {
  // Impede clickjacking (embed em iframes de outros domínios)
  'X-Frame-Options': 'DENY',
  // Impede MIME-type sniffing (vetor de XSS via upload)
  'X-Content-Type-Options': 'nosniff',
  // Controle de referrer — não vaza URL para serviços externos
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  // Habilita proteção XSS no browser (legado, mas ainda útil)
  'X-XSS-Protection': '1; mode=block',
  // Remove informações do servidor (fingerprinting)
  'X-Powered-By': '',
  // Força HTTPS em browsers após primeira visita (1 ano)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  // Permissions Policy — desabilita APIs desnecessárias
  'Permissions-Policy': 'camera=(), microphone=(self), geolocation=(), payment=()',
  // CSP: permite fontes do Google (usadas pelo design system) e bloqueia o resto
  // NOTA: ajuste 'connect-src' ao adicionar APIs externas (ex: backend real)
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",          // unsafe-inline necessário para Vite HMR em dev
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co",
    "frame-ancestors 'none'",                     // reforça X-Frame-Options
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
}

export default defineConfig({
  plugins: [
    TanStackRouterVite({
      routesDirectory: './src/routes',
      generatedRouteTree: './src/routeTree.gen.ts',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  // ── Dev server com security headers ────────────────────────────────────────
  server: {
    headers: SECURITY_HEADERS,
  },

  // ── Preview server com security headers ────────────────────────────────────
  preview: {
    headers: SECURITY_HEADERS,
  },

  build: {
    // Target moderno — evita polyfills desnecessários (+15% menor)
    target: 'es2020',

    // Reporta chunks maiores que 400kb (era 500kb)
    chunkSizeWarningLimit: 400,

    rolldownOptions: {
      output: {
        // Code splitting manual por biblioteca
        // Resultado: chunks carregados só quando necessário
        manualChunks(id: string) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom'))
            return 'react-vendor'
          if (id.includes('node_modules/@tanstack/react-router'))
            return 'router'
          if (id.includes('node_modules/@tanstack/react-query'))
            return 'query'
          if (id.includes('node_modules/@supabase'))
            return 'supabase'
          // DevTools ficam em chunk separado — tree-shaken em produção
          if (id.includes('react-router-devtools') || id.includes('react-query-devtools'))
            return 'devtools'
        },
      },
    },
  },
})
