import tailwindcss from '@tailwindcss/vite'

const FONT_FAMILIES = [
    'Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700',
    'IBM+Plex+Mono:wght@400;500',
    'IBM+Plex+Sans:wght@400;500;600',
    'Playfair+Display:wght@400;500;700',
    'Questrial',
    'Lora:wght@400;600',
    'Roboto:wght@400;500;700',
    'Inter:wght@400;500;600;700',
    'Geist:wght@400;500;600;700',
    'Geist+Mono:wght@400;500',
    'JetBrains+Mono:wght@400;500',
]

export default defineNuxtConfig({
    compatibilityDate: '2026-11-01',
    ssr: false,
    devtools: { enabled: false },
    modules: ['@pinia/nuxt', '@nuxt/eslint'],
    css: ['~/assets/css/main.css'],
    vite: { plugins: [tailwindcss()] },
    components: [{ path: '~/components', pathPrefix: false }],
    app: {
        head: {
            title: 'Nuxion Theme Builder',
            meta: [
                {
                    name: 'description',
                    content:
                        'Plan a Nuxion theme step by step and export a checked brief, stylesheet, Studio content and commands.',
                },
            ],
            link: [
                {
                    rel: 'preconnect',
                    href: 'https://fonts.googleapis.com',
                },
                {
                    rel: 'preconnect',
                    href: 'https://fonts.gstatic.com',
                    crossorigin: '',
                },
                {
                    rel: 'stylesheet',
                    href: `https://fonts.googleapis.com/css2?${FONT_FAMILIES.map((family) => `family=${family}`).join('&')}&display=swap`,
                },
            ],
        },
    },
})
