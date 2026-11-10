import type { Choice } from './fieldGuides'

/**
 * Ready-made ways to restyle a shipped block. A treatment is still one line
 * of text in the brief, so BRIEF.md and theme.css read it unchanged: the
 * options picked, then the author's own words, joined by "; ".
 */

const SEPARATOR = '; '

/** Fits any block. */
export const ANY_BLOCK_TREATMENTS: Choice[] = [
    { text: 'On the raised panel' },
    { text: 'On the night theme', tags: ['bold', 'luxurious'] },
    { text: 'Sharp corners', tags: ['technical', 'editorial', 'bold'] },
    { text: 'Softer, rounder corners', tags: ['playful', 'calm', 'warm'] },
    { text: 'Flat, no shadows', tags: ['editorial', 'technical'] },
    {
        text: 'Outlined with a hairline border',
        tags: ['technical', 'editorial'],
    },
    { text: 'Lifted with a soft shadow', tags: ['calm', 'luxurious'] },
    { text: 'Ruled lines between items', tags: ['editorial', 'technical'] },
    { text: 'Tighter spacing', tags: ['technical', 'software'] },
    { text: 'More breathing room', tags: ['calm', 'luxurious', 'natural'] },
    {
        text: 'Accent colour on icons and highlights',
        tags: ['bold', 'playful'],
    },
    { text: 'Uses the theme’s art primitives', tags: ['creative'] },
]

const FOOTER: Choice[] = [
    { text: 'Large wordmark along the bottom', tags: ['bold', 'editorial'] },
    { text: 'Social icons in the accent colour', tags: ['playful'] },
    { text: 'Links in the code font', tags: ['technical'] },
]

const VIDEO: Choice[] = [
    { text: 'Rounded corners and a soft shadow', tags: ['calm', 'playful'] },
    { text: 'Edge to edge, no frame', tags: ['bold', 'editorial'] },
]

const POSTS: Choice[] = [
    { text: 'Cards with the image on top', tags: ['playful', 'warm'] },
    {
        text: 'A plain list with dates in the code font',
        tags: ['technical', 'editorial'],
    },
    { text: 'First post featured, larger', tags: ['editorial', 'bold'] },
]

/** Keyed by shipped `_type`. Blocks without an entry get the general list only. */
export const BLOCK_TREATMENTS: Record<string, Choice[]> = {
    breadcrumbs: [
        { text: 'In the code font, uppercase', tags: ['technical'] },
        { text: 'Slashes instead of arrows', tags: ['technical', 'editorial'] },
    ],
    'carousel.logos': [
        { text: 'Logos in one colour, full colour on hover', tags: ['calm'] },
        {
            text: 'A still row instead of scrolling',
            tags: ['calm', 'editorial'],
        },
        { text: 'A ruled box around each logo', tags: ['technical'] },
    ],
    'cta-banner': [
        { text: 'Full-bleed band on the night theme', tags: ['bold'] },
        { text: 'Inset panel with rounded corners', tags: ['playful', 'warm'] },
        { text: 'Art behind the text', tags: ['creative', 'bold'] },
    ],
    faq: [
        { text: 'Questions in the heading font', tags: ['editorial'] },
        {
            text: 'Plus and minus toggle in the accent colour',
            tags: ['playful', 'bold'],
        },
        { text: 'Two columns on desktop', tags: ['technical'] },
        { text: 'All answers open, no toggles', tags: ['calm', 'editorial'] },
    ],
    'feature-grid': [
        { text: 'Icons in accent-coloured tiles', tags: ['playful', 'bold'] },
        { text: 'Numbered items instead of icons', tags: ['editorial'] },
        {
            text: 'No cards, just ruled columns',
            tags: ['editorial', 'technical'],
        },
    ],
    'form.block': [
        {
            text: 'Underlined inputs, no boxes',
            tags: ['editorial', 'luxurious'],
        },
        {
            text: 'Boxed inputs on the raised panel',
            tags: ['calm', 'software'],
        },
        { text: 'Labels in small uppercase', tags: ['technical'] },
        { text: 'Full-width submit button', tags: ['bold'] },
    ],
    'gallery.base': [
        { text: 'Uneven masonry layout', tags: ['creative', 'playful'] },
        { text: 'Captions under each image', tags: ['editorial'] },
        { text: 'Images edge to edge, no gaps', tags: ['bold'] },
    ],
    'grid.base': [
        { text: 'Real gaps between cells', tags: ['calm'] },
        {
            text: 'Shared borders and no gaps, like a table',
            tags: ['technical', 'editorial'],
        },
        { text: 'Uneven, bento-style cells', tags: ['software', 'playful'] },
    ],
    hero: [
        { text: 'Split: text left, art right', tags: ['software', 'calm'] },
        {
            text: 'Centred over a full-bleed image',
            tags: ['hospitality', 'warm'],
        },
        { text: 'Oversized headline, no image', tags: ['bold', 'editorial'] },
        { text: 'Art in the background', tags: ['creative'] },
    ],
    'link.group.component': [
        { text: 'Links as pill buttons', tags: ['playful'] },
        { text: 'Links as a ruled list with arrows', tags: ['editorial'] },
    ],
    'post.collection': POSTS,
    'post.index': POSTS,
    pricing: [
        {
            text: 'Recommended tier highlighted in the accent colour',
            tags: ['bold', 'software'],
        },
        { text: 'Prices large, in the heading font', tags: ['editorial'] },
        { text: 'Plain ruled columns, no cards', tags: ['technical'] },
    ],
    stats: [
        {
            text: 'Big figures in the heading font',
            tags: ['bold', 'editorial'],
        },
        { text: 'Ruled columns between figures', tags: ['technical'] },
        { text: 'Figures in the accent colour', tags: ['playful'] },
    ],
    team: [
        { text: 'Round portraits', tags: ['warm', 'playful'] },
        { text: 'Square portraits in black and white', tags: ['editorial'] },
        { text: 'Name and role in the code font', tags: ['technical'] },
    ],
    testimonials: [
        {
            text: 'Large quote marks in the accent colour',
            tags: ['bold', 'playful'],
        },
        { text: 'One big quote at a time', tags: ['editorial', 'luxurious'] },
        { text: 'Quote in the heading font', tags: ['editorial'] },
        { text: 'Name and role in the code font', tags: ['technical'] },
    ],
    'text-block': [
        { text: 'Narrow reading column', tags: ['editorial', 'calm'] },
        { text: 'Drop cap on the first paragraph', tags: ['editorial'] },
        { text: 'Pull quotes in the heading font', tags: ['editorial'] },
    ],
    'footer.simple-social': FOOTER,
    'footer.logo-links': FOOTER,
    'video-embed': VIDEO,
    'youtube-video-embed': VIDEO,
}

/** Every option text a block could have picked: its own, then the general ones. */
export const knownTreatments = (type: string) => [
    ...(BLOCK_TREATMENTS[type.trim()] ?? []).map((choice) => choice.text),
    ...ANY_BLOCK_TREATMENTS.map((choice) => choice.text),
]

export interface TreatmentParts {
    picks: string[]
    custom: string
}

/** Splits a treatment into the options it names and whatever else was written. */
export const splitTreatment = (
    text: string,
    known: string[]
): TreatmentParts => {
    const parts = text
        .split(';')
        .map((part) => part.trim())
        .filter(Boolean)
    return {
        picks: parts.filter((part) => known.includes(part)),
        custom: parts.filter((part) => !known.includes(part)).join(SEPARATOR),
    }
}

export const joinTreatment = ({ picks, custom }: TreatmentParts) =>
    [...picks, custom.trim()].filter(Boolean).join(SEPARATOR)

/** The treatment with an option added, or taken out if it was there. */
export const togglePick = (text: string, option: string, known: string[]) => {
    const parts = splitTreatment(text, known)
    const picks = parts.picks.includes(option)
        ? parts.picks.filter((pick) => pick !== option)
        : [...parts.picks, option]
    return joinTreatment({ ...parts, picks })
}

/** The treatment's options, followed by the author's words exactly as typed. */
export const withCustom = (text: string, custom: string, known: string[]) =>
    joinTreatment({ picks: splitTreatment(text, known).picks, custom })
