import type * as z from 'zod'
import { KEEP_WORDS } from '../brief/content'
import type { Brief } from '../brief/model'
import { describeDirection, SECTOR_IDS, VIBE_IDS } from '../inspire/direction'
import type { AssistField } from '../inspire/fieldGuides'
import { PALETTE_ROLES } from '../inspire/palettes'
import {
    artDraftSchema,
    conceptDraftSchema,
    featuresSchema,
    identityDraftSchema,
    paletteSchema,
    productDraftSchema,
    rulesSchema,
    suggestionsSchema,
    type DraftAnswer,
} from './schemas'

/** Every request to Claude: what to send, and the shape to get back. */

export interface AiRequest<T> {
    system: string
    prompt: string
    schema: z.ZodType<T>
    effort: 'low' | 'medium'
}

/** Never changes, so it stays first in every request. */
export const SYSTEM_PROMPT = `You help a designer or developer plan a theme for Nuxion, a website starter built on Nuxt and Sanity. A theme is a finished site design: colours, type, shape, art and page blocks.

Write in plain, concrete British English. Prefer specific nouns, materials and places to adjectives. Keep each answer short enough to fit the field it fills, and never pad.

Build on the concept. The theme's name, mood line and direction come first in the brief, and every answer must fit them. Where the brief already has answers, stay consistent with them.

Everything must be original. Never name real companies, products, brands, trademarks, websites or people, and never describe an existing theme or template.

How Nuxion delivers things:
- A signature feature is delivered by a theme block (written as <codename>.<block>, such as acme.pricing), an art primitive (a CSS class written as .<prefix>-<name> in theme.css §3) or a site-wide treatment (theme.css or a design token).
- A design rule says how it is kept, strongest first: token (a design token makes breaking it impossible), block (the block doesn't offer the option), studio (guidance in the editor's field description), readme (only written down). Prefer token or block.
- Colours are role-named swatches grouped into Color Themes: canvas (the page), raised (panels) and night (always dark).`

const line = (label: string, value: string) =>
    value.trim() ? `${label}: ${value.trim()}` : ''

const chromeLine = (
    label: string,
    kind: 'shipped' | 'theme',
    theme: string,
    note: string
) =>
    line(
        label,
        [
            `${kind === 'theme' ? 'built by the theme' : 'Nuxion’s shipped one, restyled'}${theme ? `, on the ${theme} Color Theme` : ''}`,
            note,
        ]
            .filter(Boolean)
            .join('. ')
    )

const blocksContext = ({ restyled, chrome }: Brief) => {
    const blocks = restyled
        .filter((block) => block.type)
        .map(
            (block) =>
                `- ${block.type}${block.treatment ? `: ${block.treatment}` : ''}`
        )
    return [
        blocks.length ? `Shipped blocks, restyled:\n${blocks.join('\n')}` : '',
        chromeLine('Navigation', chrome.nav, chrome.navTheme, chrome.navNote),
        chromeLine(
            'Footer',
            chrome.footer,
            chrome.footerTheme,
            chrome.footerNote
        ),
        line('iPhone status-bar colour', chrome.safari),
    ]
}

/** What the brief says so far, concept first, skipping anything empty. */
export const briefContext = (brief: Brief) => {
    const features = brief.features
        .filter((feature) => feature.text)
        .map(
            (feature) =>
                `- ${feature.text}${feature.ref ? ` (${feature.ref})` : ''}`
        )
    const rules = brief.rules
        .filter((rule) => rule.rule)
        .map((rule) => `- ${rule.rule}: ${rule.how || KEEP_WORDS[rule.keep]}`)
    const palette = brief.swatches
        .filter((swatch) => swatch.name)
        .map((swatch) => `${swatch.name} ${swatch.hex}`)
        .join(', ')
    return [
        'THE BRIEF SO FAR',
        line(
            'Theme',
            brief.title
                ? `${brief.title} (codename ${brief.name || 'not set'}, CSS prefix ${brief.px || 'not set'})`
                : ''
        ),
        line('Mood', brief.mood),
        line('Direction', describeDirection(brief)),
        line('Positioning', brief.positioning),
        line('Audience', brief.audience),
        features.length ? `Signature features:\n${features.join('\n')}` : '',
        line('Reference brands', brief.refs),
        line('The idea', brief.identity),
        rules.length ? `Design rules:\n${rules.join('\n')}` : '',
        line(
            'Imagery',
            [brief.art.policy, brief.art.note].filter(Boolean).join('. ')
        ),
        line('Palette', palette),
        line(
            'Color Themes',
            brief.themes
                .map((theme) => theme.key)
                .filter(Boolean)
                .join(', ')
        ),
        ...(brief.blocksOn ? blocksContext(brief) : []),
    ]
        .filter(Boolean)
        .join('\n')
}

const FIELD_TASKS: Record<AssistField, { label: string; write: string }> = {
    mood: {
        label: 'One line of mood',
        write: 'one sentence that names a real-feeling place and its materials, like "A ship’s chart room: paper, navy ink and signal flags."',
    },
    positioning: {
        label: 'Positioning',
        write: 'one sentence saying who builds what kind of site with this theme, and why they choose it',
    },
    audience: {
        label: 'Audience',
        write: 'one sentence describing who will build sites with it and how comfortable they are with Nuxt and the Studio',
    },
    refs: {
        label: 'Reference brands',
        write: 'one or two sentences naming the qualities borrowed and the kinds of printed or physical things that share them, with no real brand names',
    },
    identity: {
        label: 'The idea',
        write: 'two or three short paragraphs: the metaphor, where colour comes from, how depth is made, and the one tension that makes the theme recognisable',
    },
    artNote: {
        label: 'Imagery note',
        write: 'one sentence describing what the theme’s art is and how it is made',
    },
    navNote: {
        label: 'Navigation notes',
        write: 'one or two sentences for whoever builds the theme, saying what differs from Nuxion’s shipped navigation bar (logo, links, colour, pinning, the phone menu) and why, in terms of the concept',
    },
    footerNote: {
        label: 'Footer notes',
        write: 'one or two sentences for whoever builds the theme, saying what differs from Nuxion’s shipped footer (layout, links, colour, sign-up, wordmark) and why, in terms of the concept',
    },
    safari: {
        label: 'iPhone status-bar colour',
        write: `one sentence saying what colour the strip behind the iPhone clock should take and what the navigation bar does for it. Safari samples a bar pinned to the top: to match the page, the bar takes the page background on touch screens and drops its blur; to match the bar, the bar keeps a solid Color Theme background with no blur`,
    },
}

const request = <T>(
    prompt: string,
    schema: z.ZodType<T>,
    effort: AiRequest<T>['effort']
): AiRequest<T> => ({ system: SYSTEM_PROMPT, prompt, schema, effort })

/** Three options for one field, or three rewrites when it already has text. */
export const fieldRequest = (
    field: AssistField,
    brief: Brief,
    current: string
) => {
    const task = FIELD_TASKS[field]
    const ask = current.trim()
        ? `The field "${task.label}" currently says:\n"${current.trim()}"\n\nGive three rewrites of it, in this order: tighter, warmer, bolder. Each is ${task.write}.`
        : `Write three distinct options for the field "${task.label}". Each is ${task.write}.`
    return request(`${briefContext(brief)}\n\n${ask}`, suggestionsSchema, 'low')
}

export const featuresRequest = (brief: Brief) =>
    request(
        `${briefContext(brief)}\n\nSuggest three new signature features that fit this concept and don't repeat any above. For each, give the feature in under twelve words, its kind (block, art or site) and what delivers it, using codename "${brief.name || 'theme'}" and prefix "${brief.px || 'xx'}".`,
        featuresSchema,
        'low'
    )

export const rulesRequest = (brief: Brief) =>
    request(
        `${briefContext(brief)}\n\nSuggest three new design rules that protect this concept and don't repeat any above. For each, give the rule in under ten words, how it is kept, and one line saying how.`,
        rulesSchema,
        'low'
    )

export type DraftStep = 'concept' | 'product' | 'identity' | 'art'

export const DRAFT_STEPS: DraftStep[] = [
    'concept',
    'product',
    'identity',
    'art',
]

const DRAFT_TASKS: Record<DraftStep, string> = {
    concept: `Draft the concept: one line of mood naming a place and its materials, up to three vibes from [${VIBE_IDS.join(', ')}] and one sector from [${SECTOR_IDS.join(', ')}].`,
    product:
        'Draft the product section: positioning (one sentence), audience (one sentence), reference brands (one or two sentences, no real brand names) and three signature features, each with its kind and what delivers it.',
    identity:
        'Draft the identity section: the idea (two or three short paragraphs: metaphor, where colour comes from, how depth is made, the one recognisable tension) and three design rules with how each is kept.',
    art: 'Draft the art section: an imagery policy, one sentence describing the art, and two CSS art primitives (class name without the prefix, what it draws, variants, motion).',
}

export const draftRequest = (
    step: DraftStep,
    brief: Brief
): AiRequest<DraftAnswer> => {
    const prompt = `${briefContext(brief)}\n\n${DRAFT_TASKS[step]} Use codename "${brief.name || 'theme'}" and prefix "${brief.px || 'xx'}" wherever a name is needed.`
    switch (step) {
        case 'concept':
            return request(prompt, conceptDraftSchema, 'medium')
        case 'product':
            return request(prompt, productDraftSchema, 'medium')
        case 'identity':
            return request(prompt, identityDraftSchema, 'medium')
        case 'art':
            return request(prompt, artDraftSchema, 'medium')
    }
}

/** A palette in the ten roles. `failures` names pairs that failed last time. */
export const paletteRequest = (brief: Brief, failures: string[] = []) =>
    request(
        `${briefContext(brief)}\n\nMix an original palette for this theme as six-digit hex colours in these roles: ${PALETTE_ROLES.join(', ')}. paper and raised are light grounds; ink is text on them. ground and panel are dark grounds; chalk is text on them. accent sits on the light grounds and accentDark on the dark ones. art1 and art2 are for illustration. Text must reach 4.5:1 contrast on its grounds and accents 3:1. Give the palette a one-word name and a short note.${failures.length ? `\n\nYour last palette failed these contrast checks, so fix them:\n${failures.map((failure) => `- ${failure}`).join('\n')}` : ''}`,
        paletteSchema,
        'medium'
    )
