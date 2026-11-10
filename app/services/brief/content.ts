import type { KeepStrength } from './model'

/** The fixed wording of the checklists the brief carries. */

export const ORIGINALITY_CHECKS = [
    {
        text: 'Not designed from another theme or template, paid or free',
    },
    {
        text: 'Theme name is not a real product’s name or trademark: search the web, npm and the obvious domains',
    },
    {
        text: 'The demo company is invented, as is everyone in it. Search each name, above all anyone quoted',
        demoOnly: true,
    },
    {
        text: 'The demo’s domain is reserved (.example), and any package it prints uses a scope nobody publishes under',
        demoOnly: true,
    },
    {
        text: 'No real logo, wordmark, product screenshot, illustration or marketing copy',
    },
    { text: 'Every signature feature comes from this theme’s own concept' },
    {
        text: 'Every font is licensed for self-hosting on the sites built with it (OFL, Apache)',
    },
] as const

export const QA_GROUPS = [
    {
        title: 'Correctness',
        items: [
            '`npm run check` passes (lint, typecheck, tests, Studio build)',
            'With the theme enabled but Site theme = None, the site looks exactly as before',
            'Every theme block is insertable from the Studio under Theme: {Title} and renders from an empty, freshly inserted state',
        ],
    },
    {
        title: 'Look',
        items: [
            'Every page in light and dark (or the one pinned scheme), toggled live, nothing stale',
            'No hex in rendered markup; recolouring a swatch + `cssvars:generate` recolours the art',
            '375px, 768px, 1280px, 1600px: no horizontal scroll, headlines fit',
            'iOS Safari: status and toolbar strips tint correctly with the nav pinned',
            '`prefers-reduced-motion`: all motion stops',
        ],
    },
    {
        title: 'Access and speed',
        items: [
            'Contrast: body, muted text, accent-on-ground, button labels (both schemes)',
            'Keyboard: every theme block’s interactive parts reachable and visible on focus',
            'Lighthouse on home and a blog post: performance, accessibility, SEO',
            'Static build (`npm run generate`) and server build (`npm run build`) both render the site',
        ],
    },
] as const

/** `step` is the next-step id that ticks this row of the brief's §7. */
export const BUILD_PLAN = [
    {
        title: 'Fonts',
        detail: 'any missing families into fonts.js',
        command: 'npm run fonts:generate',
        step: 'fonts',
    },
    {
        title: 'Skeleton',
        detail: 'app and Studio folders, enabling lines, a first {name}.hero block',
        command: 'npm run scaffold:theme -- {name}',
        step: 'skeleton',
    },
    {
        title: 'Tokens',
        detail: 'themes/{name}/app/theme.css (§3.5–3.7)',
        command: '',
        step: 'css',
    },
    {
        title: 'Design content',
        detail: 'in a fresh dataset: swatches, Color Themes, Link Styles, Site theme set to {name}',
        command: 'npm run cssvars:generate',
        step: 'colours',
    },
    {
        title: 'Site-wide look',
        detail: 'type, buttons, frame, shipped blocks restyled. Check a page in both schemes',
        command: '',
        step: 'look',
    },
    {
        title: 'Art',
        detail: 'primitives and elements (§4)',
        command: '',
        step: 'art',
    },
    {
        title: 'Blocks',
        detail: 'one at a time (§5.2)',
        command: 'npm run scaffold:component -- {name}.<block> --theme {name}',
        step: 'blocks',
    },
    {
        title: 'Chrome',
        detail: 'navigation and footer (§5.3)',
        command: '',
        step: 'chrome',
    },
    {
        title: 'Tests',
        detail: 'test/unit/themes/{name}/ for the theme’s pure helpers',
        command: '',
        step: 'check',
    },
    {
        title: 'Docs',
        detail: 'themes/README.md and CHANGELOG',
        command: '',
        step: 'check',
    },
] as const

export const KEEP_OPTIONS: { value: KeepStrength; label: string }[] = [
    { value: 'token', label: '1 · Token makes it impossible' },
    { value: 'block', label: '2 · Block doesn’t offer it' },
    { value: 'studio', label: '3 · Studio field guidance' },
    { value: 'readme', label: '4 · README only' },
]

export const KEEP_WORDS: Record<KeepStrength, string> = {
    token: 'the token makes it impossible',
    block: 'the block doesn’t offer it',
    studio: 'Studio field guidance',
    readme: 'README',
}

export const fillNames = (text: string, name: string, title: string) =>
    text.replace(/\{name\}/g, name).replace(/\{Title\}/g, title)

/** The two ways to settle the iPhone status-bar colour, worded for the brief. */
export const SAFARI_TINTS = {
    page: 'Matches the page: on touch screens the bar takes the page background and drops its blur.',
    bar: 'Matches the bar: the bar keeps a solid background from its Color Theme, with no blur.',
} as const
