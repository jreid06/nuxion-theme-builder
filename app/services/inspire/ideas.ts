import type { Brief, DesignRule, Feature, KeepStrength } from '../brief/model'
import { pascalCase } from '../brief/names'
import type { Tagged } from './direction'
import type { Choice } from './fieldGuides'

/** Ready-made signature features, rules and identity answers. */

export type FeatureKind = Exclude<Feature['kind'], ''>

export interface FeatureIdea extends Tagged {
    text: string
    kind: FeatureKind
    /** May use {name}, {Name} and {px}. */
    ref: string
}

export interface RuleIdea extends Tagged {
    rule: string
    keep: KeepStrength
    how: string
}

export const fillPlaceholders = (text: string, brief: Brief) => {
    const name = brief.name || 'theme'
    return text
        .replace(/\{name\}/g, name)
        .replace(/\{Name\}/g, pascalCase(name))
        .replace(/\{px\}/g, brief.px || 'xx')
}

export const FEATURE_KINDS: { kind: FeatureKind; label: string }[] = [
    { kind: 'block', label: 'Theme blocks' },
    { kind: 'art', label: 'Art' },
    { kind: 'site', label: 'Site-wide' },
]

export const FEATURE_IDEAS: FeatureIdea[] = [
    {
        text: 'A hero that shows the product working',
        kind: 'block',
        ref: '{name}.hero + {Name}Scene element',
        tags: ['software', 'technical'],
    },
    {
        text: 'Pricing laid out as a ledger',
        kind: 'block',
        ref: '{name}.pricing',
        tags: ['software', 'services', 'editorial'],
    },
    {
        text: 'A changelog told as a story',
        kind: 'block',
        ref: '{name}.timeline',
        tags: ['software', 'technical'],
    },
    {
        text: 'Customer stories as long quotes',
        kind: 'block',
        ref: '{name}.stories',
        tags: ['editorial', 'services'],
    },
    {
        text: 'A feature grid with uneven panels',
        kind: 'block',
        ref: '{name}.bento',
        tags: ['bold', 'software'],
    },
    {
        text: 'A menu laid out like a printed card',
        kind: 'block',
        ref: '{name}.menu',
        tags: ['hospitality', 'warm'],
    },
    {
        text: 'A project index that reads like a contents page',
        kind: 'block',
        ref: '{name}.index',
        tags: ['creative', 'editorial'],
    },
    {
        text: 'An impact counter for donations and volunteers',
        kind: 'block',
        ref: '{name}.impact',
        tags: ['nonprofit', 'warm'],
    },
    {
        text: 'Product cards with a big price and one detail',
        kind: 'block',
        ref: '{name}.products',
        tags: ['retail', 'bold'],
    },
    {
        text: 'One geometric pattern used everywhere',
        kind: 'art',
        ref: '.{px}-pattern in theme.css §3',
        tags: ['bold', 'technical'],
    },
    {
        text: 'A drawn divider between sections',
        kind: 'art',
        ref: '.{px}-divider in theme.css §3',
        tags: ['editorial', 'warm'],
    },
    {
        text: 'An animated scene in the hero',
        kind: 'art',
        ref: '{Name}Scene element',
        tags: ['playful', 'software'],
    },
    {
        text: 'Cover images generated from the palette',
        kind: 'art',
        ref: 'generated assets §4',
        tags: ['technical', 'calm'],
    },
    {
        text: 'Botanical line drawings in the margins',
        kind: 'art',
        ref: '{Name}Sprig element',
        tags: ['natural', 'calm'],
    },
    {
        text: 'Oversized headlines that nearly fill the page',
        kind: 'site',
        ref: '§3.4 type scale',
        tags: ['bold', 'editorial'],
    },
    {
        text: 'A ruled frame round every section',
        kind: 'site',
        ref: 'theme.css §2 Frame',
        tags: ['editorial', 'technical'],
    },
    {
        text: 'The same tight corner on everything',
        kind: 'site',
        ref: '§3.5 corners',
        tags: ['technical', 'calm'],
    },
    {
        text: 'Monospaced labels above every heading',
        kind: 'site',
        ref: '.{px}-eyebrow in §3.4',
        tags: ['technical', 'software'],
    },
    {
        text: 'Generous space and very few colours',
        kind: 'site',
        ref: '§3.6 section spacing',
        tags: ['calm', 'luxurious'],
    },
]

export const RULE_IDEAS: RuleIdea[] = [
    {
        rule: 'Accent colour never on body copy',
        keep: 'block',
        how: 'accent is only read by button presets and art; no text field offers it',
        tags: ['calm', 'editorial'],
    },
    {
        rule: 'Buttons are always pills',
        keep: 'token',
        how: 'every Link Style sets shape: rounded',
        tags: ['playful', 'warm'],
    },
    {
        rule: 'No drop shadows',
        keep: 'token',
        how: '--shadow-media is none, and no block adds one',
        tags: ['technical', 'editorial'],
    },
    {
        rule: 'Headings are never centred',
        keep: 'block',
        how: 'block templates default to left, with no alignment option',
        tags: ['editorial', 'technical'],
    },
    {
        rule: 'One accent button per section',
        keep: 'studio',
        how: 'the button field’s description tells editors to use it once',
        tags: ['calm', 'luxurious'],
    },
    {
        rule: 'Images never have rounded corners',
        keep: 'token',
        how: '--radius-media is 0',
        tags: ['bold', 'editorial'],
    },
    {
        rule: 'No gradients',
        keep: 'block',
        how: 'no gradient swatch or art option ships',
        tags: ['technical', 'bold'],
    },
    {
        rule: 'Dark mode is a colour, never pure black',
        keep: 'token',
        how: 'the only dark grounds are the palette’s ground and panel swatches',
        tags: ['warm', 'natural'],
    },
    {
        rule: 'Every section opens with an eyebrow',
        keep: 'block',
        how: 'theme blocks require the eyebrow intro field',
        tags: ['technical', 'software'],
    },
    {
        rule: 'Long quotes are always serif',
        keep: 'token',
        how: 'the quote style reads the heading font token',
        tags: ['editorial', 'luxurious'],
    },
    {
        rule: 'Photos are never filtered',
        keep: 'studio',
        how: 'the image field’s description asks for untouched photography',
        tags: ['natural', 'hospitality'],
    },
    {
        rule: 'Prices are always the biggest thing on a card',
        keep: 'block',
        how: 'the product block sets the price in the heading style',
        tags: ['retail'],
    },
]

export const featureFromIdea = (brief: Brief, idea: FeatureIdea): Feature => ({
    text: idea.text,
    kind: idea.kind,
    ref: fillPlaceholders(idea.ref, brief),
})

export const ruleFromIdea = (brief: Brief, idea: RuleIdea): DesignRule => ({
    rule: idea.rule,
    keep: idea.keep,
    how: fillPlaceholders(idea.how, brief),
})

/** What the Delivered by box suggests for each kind of feature. */
export const REF_HINTS: Record<Feature['kind'], string> = {
    '': 'Choose a type first',
    block: '{name}.hero',
    art: '.{px}-pattern in theme.css §3',
    site: 'theme.css §2 Frame',
}

export const HOW_HINTS: Record<KeepStrength, string> = {
    token: 'Which token makes it impossible?',
    block: 'What does the block leave out?',
    studio: 'What will the field description say?',
    readme: 'Where is it written down?',
}

export type ComposerKey = 'metaphor' | 'colour' | 'depth' | 'tension'

export const COMPOSER_QUESTIONS: {
    key: ComposerKey
    question: string
    options: Choice[]
}[] = [
    {
        key: 'metaphor',
        question: 'If the page weren’t a web page, what would it be?',
        options: [
            { text: 'a museum wall label', tags: ['calm', 'luxurious'] },
            { text: 'a field notebook', tags: ['natural', 'technical'] },
            {
                text: 'a printed concert programme',
                tags: ['editorial', 'creative'],
            },
            { text: 'a workshop bench', tags: ['warm', 'technical'] },
            { text: 'a seed catalogue', tags: ['natural', 'retail'] },
            { text: 'an old timetable', tags: ['technical', 'software'] },
            { text: 'a chalkboard menu', tags: ['hospitality', 'warm'] },
            { text: 'a protest poster', tags: ['bold', 'nonprofit'] },
        ],
    },
    {
        key: 'colour',
        question: 'Where does colour come from?',
        options: [
            { text: 'the photography alone', tags: ['calm', 'hospitality'] },
            {
                text: 'one loud accent on a quiet ground',
                tags: ['bold', 'technical'],
            },
            {
                text: 'inks a printer would mix',
                tags: ['editorial', 'creative'],
            },
            { text: 'the materials of the place', tags: ['natural', 'warm'] },
            {
                text: 'small moments of action only',
                tags: ['calm', 'software'],
            },
        ],
    },
    {
        key: 'depth',
        question: 'How does one thing sit above another?',
        options: [
            {
                text: 'tone on tone, with no shadows',
                tags: ['calm', 'luxurious'],
            },
            { text: 'thin ruled lines', tags: ['editorial', 'technical'] },
            { text: 'soft layered paper', tags: ['warm', 'natural'] },
            { text: 'hard offset shadows', tags: ['bold', 'playful'] },
            {
                text: 'it doesn’t: everything is flat',
                tags: ['technical', 'bold'],
            },
        ],
    },
    {
        key: 'tension',
        question: 'What is the one tension people will recognise?',
        options: [
            {
                text: 'an old-fashioned serif against precise mono labels',
                tags: ['editorial', 'technical'],
            },
            {
                text: 'huge type against tiny captions',
                tags: ['bold', 'editorial'],
            },
            {
                text: 'a strict grid with one thing breaking it',
                tags: ['playful', 'creative'],
            },
            {
                text: 'soft colours with sharp corners',
                tags: ['calm', 'luxurious'],
            },
            {
                text: 'handmade marks against clean layout',
                tags: ['warm', 'natural'],
            },
        ],
    },
]

/** The four answers as editable paragraphs, or '' until all four are given. */
export const composeIdentity = (answers: Record<ComposerKey, string>) => {
    const { metaphor, colour, depth, tension } = answers
    if (![metaphor, colour, depth, tension].every((answer) => answer.trim())) {
        return ''
    }
    return `The page is ${metaphor.trim()}. Colour comes from ${colour.trim()}. Depth comes from ${depth.trim()}. The recognisable tension is ${tension.trim()}.`
}
