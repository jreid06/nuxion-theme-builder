import type { Brief, Chrome, ImageryPolicy } from '../brief/model'
import { rankForDirection, type Tagged } from './direction'

/** Prompts, sentence builders and starters for the fields that are hardest to start. */

export type AssistField =
    | 'mood'
    | 'positioning'
    | 'audience'
    | 'refs'
    | 'identity'
    | 'artNote'
    | 'navNote'
    | 'footerNote'
    | 'safari'

export interface Choice extends Tagged {
    text: string
}

export interface FrameSlot {
    id: string
    label: string
    options: Choice[]
}

export interface SentenceFrame {
    slots: FrameSlot[]
    build: (values: Record<string, string>) => string
}

export interface FieldGuide {
    questions: string[]
    note?: string
    /** Offers "Surprise me" mood lines. */
    surprise?: boolean
    frame?: SentenceFrame
    starters?: (brief: Brief) => Choice[]
}

/** Notes for Nuxion's own bar or footer, then for one the theme builds. */
const CHROME_STARTERS: Record<
    'nav' | 'footer',
    Record<Chrome['nav'], Choice[]>
> = {
    nav: {
        shipped: [
            {
                text: 'Always on the night theme, because the logo can’t switch with the colour scheme.',
            },
            {
                text: 'Links in the code font, uppercase and tracked.',
                tags: ['technical', 'software'],
            },
            {
                text: 'The call-to-action button in the accent style, so it stands apart from the links.',
                tags: ['bold', 'retail'],
            },
            {
                text: 'No changes to structure: it only takes the theme’s colours and type.',
                tags: ['calm'],
            },
        ],
        theme: [
            {
                text: 'Logo centred, with the links split either side.',
                tags: ['luxurious', 'hospitality', 'editorial'],
            },
            {
                text: 'A full-screen menu on phones, opened from one Menu button.',
                tags: ['bold', 'creative'],
            },
            {
                text: 'A thin announcement strip above the bar for news and offers.',
                tags: ['retail', 'software'],
            },
            {
                text: 'Scrolls away going down and comes back going up, to give the page more room.',
                tags: ['editorial', 'calm'],
            },
        ],
    },
    footer: {
        shipped: [
            {
                text: 'Always on the night theme, closing every page like the back cover of a book.',
                tags: ['editorial', 'luxurious'],
            },
            {
                text: 'Social icons in the accent colour.',
                tags: ['playful', 'bold'],
            },
            {
                text: 'No changes to structure: it only takes the theme’s colours and type.',
                tags: ['calm'],
            },
        ],
        theme: [
            {
                text: 'A large wordmark across the full width at the bottom.',
                tags: ['bold', 'creative'],
            },
            {
                text: 'A newsletter sign-up beside the link columns.',
                tags: ['retail', 'nonprofit'],
            },
            {
                text: 'Address and opening hours beside the links.',
                tags: ['hospitality', 'services'],
            },
            {
                text: 'One quiet line: copyright, three links and the social icons.',
                tags: ['calm', 'luxurious'],
            },
        ],
    },
}

const ART_STARTERS: Record<ImageryPolicy, Choice[]> = {
    '': [{ text: 'Choose an imagery policy above to see starters.' }],
    photography: [
        {
            text: 'Photography leads, shot in natural light with no retouching.',
            tags: ['natural', 'warm'],
        },
        {
            text: 'Real photos only, cropped tight on hands, tools and materials.',
            tags: ['warm', 'hospitality', 'creative'],
        },
        {
            text: 'Black and white photography, with colour kept for the interface.',
            tags: ['editorial', 'luxurious'],
        },
    ],
    illustration: [
        {
            text: 'Flat illustrations in the palette, with no outlines.',
            tags: ['playful', 'bold'],
        },
        {
            text: 'Hand-drawn line art that looks made with one pen.',
            tags: ['warm', 'natural', 'creative'],
        },
    ],
    'generated abstract': [
        {
            text: 'Generated from the palette by our own code, with no third-party images.',
            tags: ['technical', 'software'],
        },
        {
            text: 'Geometric panels built from a single repeating shape.',
            tags: ['bold', 'editorial'],
        },
        {
            text: 'Soft gradients of the palette, drawn in code so a recolour redraws them.',
            tags: ['calm', 'luxurious'],
        },
    ],
    'product UI': [
        {
            text: 'Mock product screens drawn in the theme’s own tokens.',
            tags: ['software', 'technical'],
        },
        {
            text: 'Small interface fragments, never full-page screenshots.',
            tags: ['calm', 'software'],
        },
    ],
    none: [
        {
            text: 'No images. Type and colour carry the design.',
            tags: ['editorial', 'bold'],
        },
    ],
}

export const FIELD_GUIDES: Record<AssistField, FieldGuide> = {
    mood: {
        questions: [
            'If this theme were a room, what would be on the desk?',
            'What would it smell like, or sound like?',
            'What is it definitely not?',
        ],
        surprise: true,
    },
    positioning: {
        questions: [
            'Who would buy this theme over a cheaper one?',
            'What kind of site would look wrong in it?',
        ],
        frame: {
            slots: [
                {
                    id: 'kind',
                    label: 'What gets built',
                    options: [
                        {
                            text: 'Marketing sites',
                            tags: ['software', 'services'],
                        },
                        { text: 'Portfolios', tags: ['creative', 'editorial'] },
                        {
                            text: 'Online magazines',
                            tags: ['editorial', 'creative'],
                        },
                        { text: 'Agency sites', tags: ['creative', 'bold'] },
                        {
                            text: 'Product launch pages',
                            tags: ['software', 'retail', 'bold'],
                        },
                        {
                            text: 'Membership sites',
                            tags: ['nonprofit', 'warm'],
                        },
                        {
                            text: 'Restaurant and venue sites',
                            tags: ['hospitality', 'warm'],
                        },
                    ],
                },
                {
                    id: 'who',
                    label: 'For whom',
                    options: [
                        {
                            text: 'software teams',
                            tags: ['software', 'technical'],
                        },
                        { text: 'independent studios', tags: ['creative'] },
                        {
                            text: 'restaurants and hospitality',
                            tags: ['hospitality'],
                        },
                        { text: 'non-profits', tags: ['nonprofit'] },
                        {
                            text: 'creative freelancers',
                            tags: ['creative', 'playful'],
                        },
                        {
                            text: 'professional services firms',
                            tags: ['services'],
                        },
                        { text: 'independent shops', tags: ['retail'] },
                    ],
                },
                {
                    id: 'want',
                    label: 'Who want',
                    options: [
                        {
                            text: 'to look considered rather than templated',
                            tags: ['editorial', 'technical'],
                        },
                        {
                            text: 'something calm and editorial',
                            tags: ['calm', 'editorial'],
                        },
                        {
                            text: 'to feel bold and unmistakable',
                            tags: ['bold', 'playful'],
                        },
                        {
                            text: 'to feel warm and personal',
                            tags: ['warm', 'natural'],
                        },
                        {
                            text: 'to look established and trustworthy',
                            tags: ['services', 'luxurious'],
                        },
                    ],
                },
            ],
            build: (values) =>
                `${values.kind} for ${values.who} who want ${values.want}.`,
        },
    },
    audience: {
        questions: [
            'Who will actually open this in their editor?',
            'How much will they customise it themselves?',
        ],
        frame: {
            slots: [
                {
                    id: 'who',
                    label: 'Who builds with it',
                    options: [
                        {
                            text: 'Freelance developers',
                            tags: ['technical', 'creative'],
                        },
                        {
                            text: 'Small agencies',
                            tags: ['creative', 'services'],
                        },
                        {
                            text: 'In-house marketing teams',
                            tags: ['software', 'services', 'retail'],
                        },
                        { text: 'Solo founders', tags: ['software', 'retail'] },
                    ],
                },
                {
                    id: 'skill',
                    label: 'How comfortable',
                    options: [
                        {
                            text: 'comfortable in a Nuxt repo',
                            tags: ['technical'],
                        },
                        {
                            text: 'happy editing CSS but new to Nuxt',
                            tags: ['creative'],
                        },
                        {
                            text: 'working mostly in the Studio',
                            tags: ['nonprofit', 'hospitality'],
                        },
                    ],
                },
                {
                    id: 'need',
                    label: 'What they need',
                    options: [
                        {
                            text: 'a finished look quickly',
                            tags: ['hospitality', 'retail'],
                        },
                        {
                            text: 'something clients can edit safely',
                            tags: ['services', 'nonprofit'],
                        },
                        {
                            text: 'room to add their own blocks',
                            tags: ['technical', 'software'],
                        },
                    ],
                },
            ],
            build: (values) =>
                `${values.who}, ${values.skill}, who need ${values.need}.`,
        },
    },
    refs: {
        questions: [
            'What quality are you borrowing: the pacing, the restraint, the warmth?',
            'Which printed or physical things share this feeling?',
            'What would you be embarrassed to resemble?',
        ],
        note: 'These are for orientation only. Never have one open while drawing.',
        starters: () => [
            { text: 'The pacing of a printed magazine.', tags: ['editorial'] },
            {
                text: 'The restraint of a museum catalogue.',
                tags: ['calm', 'luxurious'],
            },
            {
                text: 'The clarity of a transit map.',
                tags: ['technical', 'software'],
            },
            {
                text: 'The warmth of a hand-painted shop sign.',
                tags: ['warm', 'retail', 'hospitality'],
            },
            {
                text: 'The density of a good reference book.',
                tags: ['technical', 'services'],
            },
            {
                text: 'The energy of a screen-printed gig poster.',
                tags: ['bold', 'playful', 'creative'],
            },
            {
                text: 'The quiet of a botanical field guide.',
                tags: ['natural', 'calm', 'nonprofit'],
            },
        ],
    },
    identity: {
        questions: [
            'Could someone describe this theme over the phone from what you’ve written?',
        ],
    },
    artNote: {
        questions: [
            'What would you draw if you only had one pen and one colour?',
            'Could a recolour redo this art, or would it need redrawing?',
        ],
        starters: (brief) => ART_STARTERS[brief.art.policy],
    },
    navNote: {
        questions: [
            'Does the logo need a fixed background colour to stay readable?',
            'What should a visitor reach in one tap from any page?',
            'Does the bar stay pinned while scrolling, or scroll away?',
            'What happens on a phone: a drawer, a full-screen menu or something else?',
        ],
        note: 'Write for whoever builds the theme: what differs from Nuxion’s shipped bar, and why.',
        starters: (brief) => CHROME_STARTERS.nav[brief.chrome.nav],
    },
    footerNote: {
        questions: [
            'What should someone find at the bottom of every page?',
            'Does the footer close the page quietly, or make a statement?',
            'Is there a sign-up, an address or opening hours to show?',
        ],
        note: 'Write for whoever builds the theme: what differs from Nuxion’s shipped footer, and why.',
        starters: (brief) => CHROME_STARTERS.footer[brief.chrome.footer],
    },
    safari: {
        questions: [
            'Does the navigation bar have its own background colour, or does it sit on the page?',
            'Would a coloured strip behind the clock look deliberate, or like a mistake?',
        ],
        note: 'Most themes should match the page. Matching the bar suits a bar that is always one strong colour.',
    },
}

/** A frame's sentence, or '' until every slot has a choice. */
export const buildSentence = (
    frame: SentenceFrame,
    values: Record<string, string>
) => (frame.slots.every((slot) => values[slot.id]) ? frame.build(values) : '')

export const rankedStarters = (field: AssistField, brief: Brief) =>
    rankForDirection(FIELD_GUIDES[field].starters?.(brief) ?? [], brief)
