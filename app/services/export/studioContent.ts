import { sanityColor, isHex } from '../brief/colour'
import type { Brief, ButtonPreset, StudioOption } from '../brief/model'
import { fontStack, slugify } from '../brief/names'

/** Sanity documents built from the brief, ready for `sanity dataset import`. */

export interface StudioOptionMeta {
    key: StudioOption
    title: string
    description: string
    /** Greyed out unless this other option is on. */
    needs?: StudioOption
    /** Shows the default title and description fields beneath it. */
    seo?: boolean
}

export const STUDIO_OPTION_GROUPS: {
    title: string
    note: string
    items: StudioOptionMeta[]
}[] = [
    {
        title: 'Design',
        note: 'What the theme needs to look right',
        items: [
            {
                key: 'colours',
                title: 'Colours',
                description: 'One palette and all its swatches',
            },
            {
                key: 'themes',
                title: 'Color Themes',
                description: 'Each canvas, with its light and dark colours',
                needs: 'colours',
            },
            {
                key: 'buttons',
                title: 'Button presets',
                description: 'One Link Style per named button',
                needs: 'colours',
            },
        ],
    },
    {
        title: 'Site',
        note: 'Switches the theme on',
        items: [
            {
                key: 'settings',
                title: 'Site Settings',
                description:
                    'Site theme, default Color Theme, colour scheme and fonts',
            },
            {
                key: 'home',
                title: 'Home page',
                description:
                    'One page holding your starter hero, set as the Homepage. Site Settings requires one, and it lets you see the theme straight away',
                needs: 'settings',
            },
            {
                key: 'siteSeo',
                title: 'Site SEO',
                description: 'The default title and description',
                needs: 'settings',
                seo: true,
            },
        ],
    },
]

export const STUDIO_OPTIONS = STUDIO_OPTION_GROUPS.flatMap(
    (group) => group.items
)

/** Whether an option is on, counting the options it depends on. */
export const studioOptionOn = (brief: Brief, key: StudioOption): boolean => {
    const option = STUDIO_OPTIONS.find((item) => item.key === key)
    return (
        brief.studio[key] &&
        (!option?.needs || studioOptionOn(brief, option.needs))
    )
}

export const anyStudioOption = (brief: Brief) =>
    STUDIO_OPTIONS.some(({ key }) => studioOptionOn(brief, key))

export const allStudioOptions = (brief: Brief) =>
    STUDIO_OPTIONS.every(({ key }) => studioOptionOn(brief, key))

const reference = (id: string) => ({ _type: 'reference', _ref: id })
const slug = (current: string) => ({ _type: 'slug', current })

export interface StudioDocument {
    _id: string
    _type: string
    [field: string]: unknown
}

export const studioDocuments = (brief: Brief): StudioDocument[] => {
    const on = (key: StudioOption) => studioOptionOn(brief, key)
    const name = brief.name || 'theme'
    const px = brief.px || 'xx'
    const full = brief.dark === 'full'
    const docId = (kind: string, value: string) =>
        `${name}-${kind}-${slugify(value)}`
    const paletteId = docId('palette', 'brand')
    const palette = reference(paletteId)

    const swatchIds = new Map<string, string>()
    const swatch = (id: string) => {
        const documentId = swatchIds.get(id)
        return documentId ? reference(documentId) : undefined
    }

    const swatches: StudioDocument[] = on('colours')
        ? brief.swatches
              .filter(({ hex, slug: value }) => isHex(hex) && value)
              .map((item) => {
                  const _id = docId('color', item.slug)
                  swatchIds.set(item.id, _id)
                  return {
                      _id,
                      _type: 'color.theme.single',
                      title: item.name || item.slug,
                      palette,
                      cssvar: slug(`${px}-${item.slug}`),
                      color: sanityColor(item.hex),
                  }
              })
        : []

    const paletteDocs: StudioDocument[] = on('colours')
        ? [
              {
                  _id: paletteId,
                  _type: 'color.palette',
                  title: brief.title || name,
              },
          ]
        : []

    const themes: StudioDocument[] = on('themes')
        ? brief.themes
              .filter(
                  ({ light }) =>
                      swatchIds.has(light.bg) && swatchIds.has(light.text)
              )
              .map((theme) => ({
                  _id: docId('theme', theme.key),
                  _type: 'color.theme',
                  title: theme.note
                      ? `${theme.key} · ${theme.note}`
                      : theme.key,
                  palette,
                  cssvar: slug(`${px}-${theme.key}`),
                  background: swatch(theme.light.bg),
                  text: swatch(theme.light.text),
                  accent: swatch(theme.light.accent),
                  ...(full
                      ? {
                            backgroundDark: swatch(theme.dark.bg),
                            textDark: swatch(theme.dark.text),
                            accentDark: swatch(theme.dark.accent),
                        }
                      : {}),
              }))
        : []

    const design = (preset: ButtonPreset) => {
        const base = {
            _type: 'link.style.design',
            style: preset.style,
            colorSource: preset.source,
            ...(preset.style === 'default' ? {} : { shape: preset.shape }),
        }
        if (preset.source === 'seed') {
            return {
                ...base,
                seedColor: swatch(preset.light.fill),
                ...(full ? { seedColorDark: swatch(preset.dark.fill) } : {}),
            }
        }
        if (preset.source !== 'manual') return base
        return {
            ...base,
            background: swatch(preset.light.fill),
            text: swatch(preset.light.text),
            border: swatch(preset.light.fill),
            ...(full
                ? {
                      backgroundDark: swatch(preset.dark.fill),
                      textDark: swatch(preset.dark.text),
                      borderDark: swatch(preset.dark.fill),
                  }
                : {}),
        }
    }

    const buttons: StudioDocument[] = on('buttons')
        ? brief.buttons
              .filter((preset) => preset.name)
              .map((preset) => ({
                  _id: docId('style', preset.name),
                  _type: 'link.styles',
                  title: preset.use
                      ? `${preset.name} · ${preset.use}`
                      : preset.name,
                  palette,
                  design: design(preset),
              }))
        : []

    const seo = {
        _type: 'seo',
        title: brief.siteSeo.title || brief.title || name,
        description:
            brief.siteSeo.description || brief.mood || brief.title || name,
    }

    const home: StudioDocument[] = on('home')
        ? [
              {
                  _id: docId('page', 'home'),
                  _type: 'page',
                  title: 'Home',
                  isPublished: true,
                  routeOptions: {
                      _type: 'page.routing.options',
                      slug: slug('home'),
                      includeInSitemap: true,
                  },
                  showNav: true,
                  showFooter: true,
                  seo,
                  components: [
                      {
                          _key: 'hero',
                          _type: `${name}.hero`,
                          heading: brief.headline || brief.title || name,
                          description: brief.mood,
                      },
                  ],
              },
          ]
        : []

    const fonts = {
        _type: 'font.options',
        primaryFont: fontStack(brief.fonts.heading) || undefined,
        bodyFont: fontStack(brief.fonts.body) || undefined,
        codeFont: fontStack(brief.fonts.code) || undefined,
    }

    const [defaultTheme] = themes
    const [homePage] = home
    const settings: StudioDocument[] = on('settings')
        ? [
              {
                  _id: 'siteSettings',
                  _type: 'siteSettings',
                  title: brief.title || name,
                  siteTheme: name,
                  colorScheme:
                      !full && brief.scheme === 'system'
                          ? 'light'
                          : brief.scheme,
                  theme: defaultTheme ? reference(defaultTheme._id) : undefined,
                  frontpage: homePage ? reference(homePage._id) : undefined,
                  globalFonts: fonts,
                  seo: on('siteSeo') ? seo : undefined,
              },
          ]
        : []

    return [
        ...paletteDocs,
        ...swatches,
        ...themes,
        ...buttons,
        ...home,
        ...settings,
    ]
}

/** One JSON document per line, the format `sanity dataset import` reads. */
export const renderStudioContent = (brief: Brief) =>
    studioDocuments(brief)
        .map((document) => JSON.stringify(document))
        .join('\n')

export const studioContentPath = (brief: Brief) =>
    `themes/${brief.name || '<name>'}/studio-content.ndjson`

export const studioImportCommand = (brief: Brief) =>
    `(cd studio && npx sanity dataset import ../${studioContentPath(brief)} ${brief.name || '<name>'} --replace)`
