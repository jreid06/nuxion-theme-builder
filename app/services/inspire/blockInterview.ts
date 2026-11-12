import {
    blankAnswers,
    blockField,
    type BlockAnswers,
    type BlockField,
    type Brief,
} from '../brief/model'
import type { Tagged } from './direction'

/**
 * The questions a block designer asks before building a section, and the
 * fixed rules that turn the answers into fields. Names come from Nuxion's
 * Markdown lists wherever one fits, so the content reaches the page's Markdown
 * version and llms.txt. Claude, when connected, refines the result.
 */

export interface InterviewOption extends Tagged {
    id: string
    label: string
}

export interface Job extends InterviewOption {
    shape: Exclude<BlockAnswers['shape'], ''>
    /** What the list of items is called. */
    list: string
    /** Item parts picked when the author picks this job. */
    parts: string[]
}

export const JOBS: Job[] = [
    {
        id: 'introduce',
        label: 'Introduce the page',
        shape: 'single',
        list: 'items',
        parts: [],
        tags: ['bold', 'editorial'],
    },
    {
        id: 'how',
        label: 'Explain how it works',
        shape: 'list',
        list: 'points',
        parts: ['title', 'text', 'icon'],
        tags: ['software', 'services', 'calm'],
    },
    {
        id: 'features',
        label: 'Show features',
        shape: 'list',
        list: 'features',
        parts: ['title', 'text', 'icon'],
        tags: ['software', 'technical'],
    },
    {
        id: 'prove',
        label: 'Prove it with numbers',
        shape: 'list',
        list: 'stats',
        parts: ['number', 'label'],
        tags: ['technical', 'nonprofit', 'bold'],
    },
    {
        id: 'quotes',
        label: 'Share what people say',
        shape: 'list',
        list: 'testimonials',
        parts: ['quote', 'name', 'role', 'image'],
        tags: ['warm', 'services', 'hospitality'],
    },
    {
        id: 'compare',
        label: 'Compare plans or prices',
        shape: 'list',
        list: 'tiers',
        parts: ['title', 'price', 'text', 'link', 'flag'],
        tags: ['software', 'retail'],
    },
    {
        id: 'story',
        label: 'Tell a story over time',
        shape: 'list',
        list: 'releases',
        parts: ['date', 'title', 'text'],
        tags: ['editorial', 'nonprofit'],
    },
    {
        id: 'work',
        label: 'Show work or a gallery',
        shape: 'list',
        list: 'items',
        parts: ['image', 'title', 'text'],
        tags: ['creative', 'retail', 'hospitality'],
    },
    {
        id: 'faq',
        label: 'Answer questions',
        shape: 'list',
        list: 'items',
        parts: ['question', 'answer'],
        tags: ['calm', 'services'],
    },
    {
        id: 'team',
        label: 'Introduce the team',
        shape: 'list',
        list: 'members',
        parts: ['image', 'name', 'role', 'text'],
        tags: ['warm', 'services', 'creative'],
    },
    {
        id: 'convert',
        label: 'Get people to act',
        shape: 'single',
        list: 'items',
        parts: [],
        tags: ['bold', 'retail'],
    },
]

export const SHAPES: InterviewOption[] = [
    { id: 'single', label: 'One piece of content' },
    { id: 'list', label: 'A list of similar items' },
    { id: 'both', label: 'A main piece plus a list' },
]

interface Part extends InterviewOption {
    field: () => BlockField
}

/**
 * In the order item fields are written: the scaffolder makes an item's first
 * short text its card title, so the parts that read as titles come first.
 */
export const ITEM_PARTS: Part[] = [
    {
        id: 'title',
        label: 'Title',
        field: () => blockField('title', 'string', true),
    },
    {
        id: 'question',
        label: 'Question',
        field: () => blockField('question', 'string', true),
    },
    { id: 'name', label: 'Person’s name', field: () => blockField('name') },
    {
        id: 'number',
        label: 'Number or figure',
        field: () => blockField('value'),
    },
    { id: 'price', label: 'Price', field: () => blockField('price') },
    { id: 'label', label: 'Label', field: () => blockField('label') },
    { id: 'role', label: 'Role or job title', field: () => blockField('role') },
    { id: 'date', label: 'Date', field: () => blockField('date') },
    {
        id: 'text',
        label: 'Short text',
        field: () => blockField('body', 'text'),
    },
    { id: 'quote', label: 'Quote', field: () => blockField('quote', 'text') },
    {
        id: 'rich',
        label: 'Rich text',
        field: () => blockField('content', 'portable-text'),
    },
    {
        id: 'answer',
        label: 'Answer',
        field: () => blockField('answer', 'portable-text'),
    },
    { id: 'image', label: 'Image', field: () => blockField('image', 'image') },
    { id: 'icon', label: 'Icon name', field: () => blockField('icon') },
    { id: 'link', label: 'Link', field: () => blockField('link', 'link') },
    {
        id: 'flag',
        label: '“Highlight this” switch',
        field: () => blockField('highlighted', 'boolean'),
    },
]

export const SECTION_PARTS: Part[] = [
    {
        id: 'image',
        label: 'An image or art',
        field: () => blockField('image', 'image'),
    },
    {
        id: 'rich',
        label: 'A rich text body',
        field: () => blockField('content', 'portable-text'),
    },
    {
        id: 'note',
        label: 'A footnote',
        field: () => blockField('note', 'text'),
    },
]

export const ACTIONS: Part[] = [
    {
        id: 'itemLink',
        label: 'Click through to another page',
        field: () => blockField('link', 'link'),
    },
    {
        id: 'buttons',
        label: 'More buttons than the intro’s',
        field: () => blockField('buttons', 'link.group'),
    },
    {
        id: 'toggle',
        label: 'Switch between two views',
        field: () => blockField('toggle', 'boolean'),
    },
    {
        id: 'expand',
        label: 'Expand for more',
        field: () => blockField('collapsible', 'boolean'),
    },
]

export const jobOf = (id: string) => JOBS.find((job) => job.id === id)

/** The answers a job starts from, keeping anything already chosen. */
export const pickJob = (answers: BlockAnswers, id: string): BlockAnswers => {
    const job = jobOf(id)
    if (!job) return answers
    return {
        ...answers,
        job: id,
        shape: job.shape,
        itemParts: job.parts.length ? [...job.parts] : answers.itemParts,
    }
}

const fieldsFor = (parts: Part[], ids: string[]) =>
    parts.filter((part) => ids.includes(part.id)).map((part) => part.field())

/** The fields a block's answers call for, after the intro it already has. */
export const fieldsFromAnswers = (answers: BlockAnswers): BlockField[] => {
    const job = jobOf(answers.job)
    const shape = answers.shape || job?.shape || 'single'
    const hasList = shape !== 'single'
    const itemLink = answers.actions.includes('itemLink')

    const main = fieldsFor(
        SECTION_PARTS.filter((part) => part.id !== 'note'),
        answers.sectionParts
    )
    const list: BlockField[] = []
    if (hasList) {
        const ids = answers.itemParts.length
            ? answers.itemParts
            : job?.parts.length
              ? job.parts
              : ['title', 'text']
        const items = fieldsFor(ITEM_PARTS, itemLink ? [...ids, 'link'] : ids)
        list.push(blockField(job?.list ?? 'items', 'list', false, items))
    }
    const after = [
        ...fieldsFor(
            SECTION_PARTS.filter((part) => part.id === 'note'),
            answers.sectionParts
        ),
        ...fieldsFor(
            ACTIONS.filter((action) => action.id !== 'itemLink' || !hasList),
            answers.actions
        ),
    ]
    return [...main, ...list, ...after]
}

/** First match wins, so `logo` is caught before `log` reads it as a timeline. */
const JOB_WORDS: [RegExp, string][] = [
    [/logo/, 'work'],
    [/pric|plan|tier/, 'compare'],
    [/faq|question/, 'faq'],
    [/team|people|staff/, 'team'],
    [/stat|metric|number|figure/, 'prove'],
    [/testimon|quote|stor|review/, 'quotes'],
    [/timeline|changelog|history|release|log/, 'story'],
    [/gallery|work|portfolio|case/, 'work'],
    [/feature|bento|grid|benefit/, 'features'],
    [/step|how|process/, 'how'],
    [/hero|intro/, 'introduce'],
    [/cta|signup|sign-up|contact|subscribe/, 'convert'],
]

/** The job a block's name suggests, or '' when it suggests none. */
export const guessJob = (slug: string) =>
    JOB_WORDS.find(([pattern]) => pattern.test(slug))?.[1] ?? ''

export interface BlockIdea {
    slug: string
    purpose: string
    answers: BlockAnswers
}

/**
 * Signature features the brief says a theme block delivers
 * (`<codename>.<block>`), for blocks not planned yet.
 */
export const featureBlockIdeas = (brief: Brief): BlockIdea[] => {
    const name = brief.name || 'theme'
    const pattern = new RegExp(`\\b${name}\\.([a-z][a-z0-9-]*)`, 'g')
    const planned = new Set(brief.blocks.map((block) => block.slug))
    const ideas: BlockIdea[] = []
    for (const feature of brief.features) {
        for (const match of feature.ref.matchAll(pattern)) {
            const slug = match[1]!
            if (planned.has(slug)) continue
            planned.add(slug)
            ideas.push({
                slug,
                purpose: feature.text,
                answers: pickJob(blankAnswers(), guessJob(slug)),
            })
        }
    }
    return ideas
}

const labels = (options: InterviewOption[], ids: string[]) =>
    options
        .filter((option) => ids.includes(option.id))
        .map((option) => option.label.toLowerCase())
        .join(', ')

/** The answers in words, skipping any question left unanswered. */
export const describeAnswers = (answers: BlockAnswers) => {
    const shape = SHAPES.find((option) => option.id === answers.shape)
    return [
        jobOf(answers.job) &&
            `Its job: ${jobOf(answers.job)!.label.toLowerCase()}.`,
        shape && `It holds ${shape.label.toLowerCase()}.`,
        answers.itemParts.length &&
            `Each item has: ${labels(ITEM_PARTS, answers.itemParts)}.`,
        answers.sectionParts.length &&
            `The section also has: ${labels(SECTION_PARTS, answers.sectionParts)}.`,
        answers.actions.length &&
            `Visitors can: ${labels(ACTIONS, answers.actions)}.`,
        answers.special.trim() &&
            `The author adds: “${answers.special.trim()}”`,
    ]
        .filter(Boolean)
        .join(' ')
}
