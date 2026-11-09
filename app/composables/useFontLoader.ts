import { catalogFont } from '~/services/brief/nuxion'

const requested = new Set<string>()

/** Fetches a family that isn't in the app's own font link, for the preview. */
export const useFontLoader = () => ({
    loadFont(family: string) {
        if (!family || catalogFont(family) || requested.has(family)) return
        requested.add(family)
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@400;500;700&display=swap`
        document.head.appendChild(link)
    },
})
