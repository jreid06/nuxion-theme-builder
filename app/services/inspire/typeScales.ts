import { typeRow, type Brief, type TypeRow } from '../brief/model'
import type { Tagged } from './direction'

/**
 * Ready-made type scales. Each is a handful of numbers (a body size, a ratio
 * between heading steps, a weight, tracking and leading) that `buildScale`
 * turns into every row, on mobile and desktop.
 */

export interface TypeScaleSpec {
    /** Body size in px. Sizes are rounded to 2px, so use even numbers. */
    body: { mobile: number; desktop: number }
    /** Each heading step is this many times the one below it. */
    ratio: { mobile: number; desktop: number }
    headingWeight: number
    /** Tracking on the largest heading, in em. Eases to 0 by `.heading-5`. */
    headingTracking: number
    /** Line height on the largest heading. Smaller headings loosen a little. */
    headingLeading: number
    bodyLeading: number
    eyebrow: { size: number; tracking: number; weight: number }
}

export interface TypeScalePreset extends Tagged {
    name: string
    note: string
    spec: TypeScaleSpec
}

type Slot = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'eyebrow'

const HEADINGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

/** The rows a scale fills, with the class and role a new row gets. */
const SLOTS: { slot: Slot; cls: string; role: string }[] = [
    { slot: 'h1', cls: '.heading-1', role: 'display' },
    { slot: 'h2', cls: '.heading-2', role: 'heading-lg' },
    { slot: 'h3', cls: '.heading-3', role: 'heading' },
    { slot: 'h4', cls: '.heading-4', role: 'heading-sm' },
    { slot: 'h5', cls: '.heading-5', role: 'subheading' },
    { slot: 'h6', cls: '.heading-6', role: '' },
    { slot: 'body', cls: '.nuxion-paragraph', role: 'body' },
    { slot: 'eyebrow', cls: '.{px}-eyebrow', role: 'caption / label' },
]

/** Which row of a scale a class is, or null for a row the author added. */
export const slotOf = (cls: string): Slot | null => {
    const known = SLOTS.find((item) => item.cls === cls.trim())
    if (known) return known.slot
    return /eyebrow/.test(cls) ? 'eyebrow' : null
}

const trim = (value: number, places: number) => String(+value.toFixed(places))

/** Rounded to 2px, so sizes land on clean rem values. */
const rem = (px: number) => `${trim(Math.round(px / 2) / 8, 4)}rem`
const em = (value: number) => {
    const rounded = Math.round(value / 0.005) * 0.005
    return rounded === 0 ? '0' : `${trim(rounded, 3)}em`
}

/** Every row of a scale, largest heading first. */
export const buildScale = (spec: TypeScaleSpec): TypeRow[] =>
    SLOTS.map(({ slot, cls, role }) => {
        if (slot === 'body') {
            return typeRow(
                cls,
                role,
                rem(spec.body.mobile),
                rem(spec.body.desktop),
                trim(spec.bodyLeading, 2),
                '0',
                '400'
            )
        }
        if (slot === 'eyebrow') {
            const size = rem(spec.eyebrow.size)
            return typeRow(
                cls,
                role,
                size,
                size,
                '1.4',
                em(spec.eyebrow.tracking),
                String(spec.eyebrow.weight)
            )
        }
        const step = HEADINGS.indexOf(slot)
        const power = HEADINGS.length - 1 - step
        return typeRow(
            cls,
            role,
            rem(spec.body.mobile * spec.ratio.mobile ** power),
            rem(spec.body.desktop * spec.ratio.desktop ** power),
            trim(Math.min(spec.headingLeading + step * 0.05, 1.4), 2),
            em(spec.headingTracking * Math.max(0, 1 - step / 4)),
            String(spec.headingWeight)
        )
    })

/**
 * Puts a scale's sizes, leading, tracking and weight into the rows it
 * recognises. Class names, roles the author wrote and rows they added stay;
 * rows they deleted aren't brought back. An empty scale gets every row.
 */
export const applyScale = (brief: Brief, rows: TypeRow[]) => {
    if (!brief.scale.length) {
        brief.scale = rows.map((row) => ({ ...row }))
        return
    }
    const bySlot = new Map(rows.map((row) => [slotOf(row.cls), row]))
    for (const row of brief.scale) {
        const source = bySlot.get(slotOf(row.cls))
        if (!source) continue
        row.mobile = source.mobile
        row.desktop = source.desktop
        row.lh = source.lh
        row.tracking = source.tracking
        row.weight = source.weight
        row.role ||= source.role
    }
}

/** "Display 54px, 40px on phones · body 18px", read from the built rows. */
export const describeScale = (rows: TypeRow[]) => {
    const px = (value = '') => `${parseFloat(value) * 16}px`
    const display = rows.find((row) => slotOf(row.cls) === 'h1')
    const body = rows.find((row) => slotOf(row.cls) === 'body')
    return `Display ${px(display?.desktop)}, ${px(display?.mobile)} on phones · body ${px(body?.desktop)}`
}

const eyebrow = { size: 12, tracking: 0.08, weight: 600 }

export const TYPE_SCALE_PRESETS: TypeScalePreset[] = [
    {
        name: 'Classic',
        note: 'Major third (1.25). A balanced default that suits most sites.',
        tags: ['services', 'nonprofit', 'calm'],
        spec: {
            body: { mobile: 16, desktop: 18 },
            ratio: { mobile: 1.2, desktop: 1.25 },
            headingWeight: 700,
            headingTracking: -0.02,
            headingLeading: 1.1,
            bodyLeading: 1.6,
            eyebrow,
        },
    },
    {
        name: 'Product',
        note: 'Minor third (1.2). Compact and even, for apps, docs and dashboards.',
        tags: ['technical', 'software', 'calm'],
        spec: {
            body: { mobile: 16, desktop: 16 },
            ratio: { mobile: 1.15, desktop: 1.2 },
            headingWeight: 600,
            headingTracking: -0.015,
            headingLeading: 1.15,
            bodyLeading: 1.55,
            eyebrow: { size: 12, tracking: 0.06, weight: 500 },
        },
    },
    {
        name: 'Editorial',
        note: 'Perfect fourth (1.333). Big, light display type and roomy reading text.',
        tags: ['editorial', 'creative', 'luxurious'],
        spec: {
            body: { mobile: 18, desktop: 20 },
            ratio: { mobile: 1.2, desktop: 1.333 },
            headingWeight: 400,
            headingTracking: -0.01,
            headingLeading: 1.05,
            bodyLeading: 1.7,
            eyebrow: { size: 12, tracking: 0.12, weight: 500 },
        },
    },
    {
        name: 'Statement',
        note: 'Steep (1.4). Loud, heavy headlines for launches and shops.',
        tags: ['bold', 'playful', 'retail'],
        spec: {
            body: { mobile: 16, desktop: 18 },
            ratio: { mobile: 1.25, desktop: 1.4 },
            headingWeight: 800,
            headingTracking: -0.03,
            headingLeading: 1,
            bodyLeading: 1.55,
            eyebrow: { size: 14, tracking: 0.08, weight: 700 },
        },
    },
    {
        name: 'Gentle',
        note: 'Major second (1.125). Large, easy body text and quiet headings.',
        tags: ['calm', 'natural', 'nonprofit', 'warm'],
        spec: {
            body: { mobile: 18, desktop: 20 },
            ratio: { mobile: 1.125, desktop: 1.2 },
            headingWeight: 500,
            headingTracking: 0,
            headingLeading: 1.25,
            bodyLeading: 1.75,
            eyebrow,
        },
    },
    {
        name: 'Refined',
        note: 'Major third to perfect fourth. Light headings and wide labels for a quiet, premium feel.',
        tags: ['luxurious', 'hospitality', 'warm'],
        spec: {
            body: { mobile: 16, desktop: 18 },
            ratio: { mobile: 1.25, desktop: 1.333 },
            headingWeight: 300,
            headingTracking: 0,
            headingLeading: 1.15,
            bodyLeading: 1.7,
            eyebrow: { size: 12, tracking: 0.2, weight: 500 },
        },
    },
]

export interface Suggestion {
    value: string
    label: string
}

/** Common values offered in each cell of the type scale. */
export const TYPE_SUGGESTIONS: Record<
    'size' | 'lh' | 'tracking' | 'weight',
    Suggestion[]
> = {
    size: [
        { value: '0.75rem', label: '12px · labels' },
        { value: '0.875rem', label: '14px · small print' },
        { value: '1rem', label: '16px · body' },
        { value: '1.125rem', label: '18px · large body' },
        { value: '1.25rem', label: '20px · small heading' },
        { value: '1.5rem', label: '24px' },
        { value: '1.875rem', label: '30px' },
        { value: '2.25rem', label: '36px' },
        { value: '3rem', label: '48px · section heading' },
        { value: '3.75rem', label: '60px' },
        { value: '4.5rem', label: '72px · display' },
        { value: '6rem', label: '96px · big display' },
    ],
    lh: [
        { value: '1', label: 'Solid · very large display' },
        { value: '1.1', label: 'Tight · display headings' },
        { value: '1.2', label: 'Headings' },
        { value: '1.3', label: 'Small headings' },
        { value: '1.4', label: 'Labels' },
        { value: '1.6', label: 'Body copy' },
        { value: '1.75', label: 'Airy body copy' },
    ],
    tracking: [
        { value: '-0.03em', label: 'Tight · very large type' },
        { value: '-0.02em', label: 'Display' },
        { value: '-0.01em', label: 'Headings' },
        { value: '0', label: 'Normal · body copy' },
        { value: '0.05em', label: 'Small capitals' },
        { value: '0.1em', label: 'Uppercase labels' },
        { value: '0.2em', label: 'Wide labels' },
    ],
    weight: [
        { value: '300', label: 'Light' },
        { value: '400', label: 'Regular' },
        { value: '500', label: 'Medium' },
        { value: '600', label: 'Semibold' },
        { value: '700', label: 'Bold' },
        { value: '800', label: 'Extra bold' },
    ],
}
