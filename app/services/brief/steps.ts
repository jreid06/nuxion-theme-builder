import type { Issue } from './checks'
import type { Brief } from './model'

/** The step registry: the rail, the page headers and the status dots read it. */

export type StepId =
    | 'concept'
    | 'product'
    | 'identity'
    | 'swatches'
    | 'themes'
    | 'buttons'
    | 'type'
    | 'shape'
    | 'art'
    | 'blocks'
    | 'review'

export interface StepMeta {
    id: StepId
    sec: string
    title: string
    /** Where the answers end up. `<name>` becomes the theme's codename. */
    lands: string
    lede: string
    optional?: boolean
    filled: (brief: Brief) => boolean
}

export const STEPS: StepMeta[] = [
    {
        id: 'concept',
        sec: 'Top',
        title: 'Concept',
        lands: 'BRIEF.md header',
        lede: 'Start with the name and the mood. The name becomes the namespace of everything you build, so changing it later means renaming every file.',
        filled: (brief) => Boolean(brief.title && brief.mood),
    },
    {
        id: 'product',
        sec: '§1',
        title: 'Product',
        lands: 'BRIEF.md',
        lede: 'Who is this for, and what will people remember about it? A signature feature only counts if something in the build delivers it.',
        filled: (brief) => Boolean(brief.positioning && brief.features.length),
    },
    {
        id: 'identity',
        sec: '§2',
        title: 'Identity',
        lands: 'BRIEF.md',
        lede: 'Describe the design in words, then decide how each rule survives contact with editors. A rule that is only written down will be broken.',
        filled: (brief) => Boolean(brief.identity && brief.rules.length),
    },
    {
        id: 'swatches',
        sec: '§3.1',
        title: 'Swatches',
        lands: 'Studio content, created from Review and export',
        lede: 'One swatch per named colour. Name each slug for its job, because theme.css reads it by that name and it has to stay true after a recolour.',
        filled: (brief) => brief.swatches.length > 0,
    },
    {
        id: 'themes',
        sec: '§3.2',
        title: 'Color Themes',
        lands: 'Studio content, created from Review and export',
        lede: 'One Color Theme for each canvas the design uses. Hover, contrast ink, outline border and surface colours are generated from the accent, so they need no swatches.',
        filled: (brief) =>
            brief.themes.some((theme) => theme.light.bg && theme.light.text),
    },
    {
        id: 'buttons',
        sec: '§3.3',
        title: 'Buttons',
        lands: 'Link Styles in Studio; metrics in theme.css',
        lede: 'Colours belong to each preset. Padding, type size and corner radius are shared tokens, so every preset keeps its proportions at each size.',
        filled: (brief) => brief.buttons.length > 0,
    },
    {
        id: 'type',
        sec: '§3.4',
        title: 'Typography',
        lands: 'Fonts in Site Settings; scale in theme.css',
        lede: 'Pick three families and set the scale. Nuxion ships a set of fonts. Anything else needs a small change to the starter and a licence that allows self-hosting.',
        filled: (brief) =>
            Boolean(brief.fonts.heading.family && brief.fonts.body.family),
    },
    {
        id: 'shape',
        sec: '§3.5–3.7',
        title: 'Shape and spacing',
        lands: 'themes/<name>/app/theme.css',
        lede: 'Set the site-wide width, corners, depth and spacing. Anything you leave alone keeps Nuxion’s default, and the preview updates as you go.',
        filled: ({ layout }) =>
            Boolean(
                layout.width ||
                Object.values(layout.radius).some(Boolean) ||
                layout.depth !== 'shadows' ||
                layout.spacing !== 'default' ||
                Object.values(layout.measure).some(Boolean)
            ),
    },
    {
        id: 'art',
        sec: '§4',
        title: 'Art and imagery',
        lands: 'themes/<name>/app/theme.css and elements/',
        lede: 'List every graphic the theme draws, so nothing gets invented halfway through the build. A graphic is one of three kinds, and the kind decides where it lives and who makes it.',
        filled: (brief) => Boolean(brief.art.policy),
    },
    {
        id: 'blocks',
        sec: '§5',
        title: 'Blocks',
        optional: true,
        lands: 'themes/<name>/app/blocks and studio/schemas/themes/<name>',
        lede: 'Blocks are the sections an editor stacks to build a page. This step is optional, so you can plan them somewhere else or come back once the look is settled.',
        filled: (brief) => brief.blocksOn && brief.blocks.length > 0,
    },
    {
        id: 'review',
        sec: '§7–8',
        title: 'Review and export',
        lands: 'Your Nuxion repo',
        lede: 'This is the hand-off from planning to building. You copy four things into your Nuxion repo, then follow the numbered steps. You can export a draft at any time.',
        filled: () => false,
    },
]

export type StepStatus = 'todo' | 'done' | 'warn' | 'error' | 'skip'

export const stepStatus = (
    step: StepMeta,
    brief: Brief,
    issues: Issue[]
): StepStatus => {
    if (step.optional && !brief.blocksOn) return 'skip'
    const own = issues.filter((issue) => issue.step === step.id)
    if (own.some((issue) => issue.severity === 'error')) return 'error'
    if (own.length) return 'warn'
    return step.filled(brief) ? 'done' : 'todo'
}

/** The steps that count towards "x of y complete". */
export const coreSteps = STEPS.filter(
    (step) => step.id !== 'review' && !step.optional
)

export interface StepNavigation {
    previous?: StepMeta
    next?: StepMeta
    /** An optional step that "next" jumps over, still offered beside it. */
    skipped?: StepMeta
}

export const stepNavigation = (
    id: StepId,
    brief: Brief,
    steps: StepMeta[] = STEPS
): StepNavigation => {
    const index = steps.findIndex((step) => step.id === id)
    const isSkipped = (step?: StepMeta) =>
        Boolean(step?.optional && !brief.blocksOn)
    const before = steps[index - 1]
    const after = steps[index + 1]
    return {
        previous: isSkipped(before) ? steps[index - 2] : before,
        next: isSkipped(after) ? steps[index + 2] : after,
        skipped: isSkipped(after) ? after : undefined,
    }
}
