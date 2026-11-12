import { describe, expect, it } from 'vitest'
import { everyAnswer } from '../../support/blockAnswers'
import { checkFields, flattenFields } from '~/services/brief/blockFields'
import { exampleBrief } from '~/services/brief/example'
import { blankAnswers, type BlockAnswers } from '~/services/brief/model'
import { markdownRole } from '~/services/brief/nuxion'
import {
    describeAnswers,
    featureBlockIdeas,
    fieldsFromAnswers,
    guessJob,
    pickJob,
} from '~/services/inspire/blockInterview'

const answers = (extra: Partial<BlockAnswers>): BlockAnswers => ({
    ...blankAnswers(),
    ...extra,
})

describe('fieldsFromAnswers', () => {
    it('never produces fields the scaffolder would refuse', () => {
        for (const answer of everyAnswer) {
            expect(checkFields(fieldsFromAnswers(answer))).toEqual([])
        }
    })

    it('reaches Markdown whenever it makes a list', () => {
        for (const answer of everyAnswer.filter((a) => a.shape !== 'single')) {
            const names = flattenFields(fieldsFromAnswers(answer)).map(
                (field) => field.name
            )
            expect(names.some((name) => markdownRole(name))).toBe(true)
        }
    })

    it('names the list after the job, and gives a FAQ questions and answers', () => {
        expect(fieldsFromAnswers(pickJob(blankAnswers(), 'faq'))).toEqual([
            {
                name: 'items',
                type: 'list',
                required: false,
                of: [
                    { name: 'question', type: 'string', required: true },
                    { name: 'answer', type: 'portable-text', required: false },
                ],
            },
        ])
        expect(
            fieldsFromAnswers(pickJob(blankAnswers(), 'compare'))[0]
        ).toMatchObject({ name: 'tiers', type: 'list' })
    })

    it('titles each item first, whatever order the parts were picked in', () => {
        const [list] = fieldsFromAnswers(
            answers({ shape: 'list', itemParts: ['image', 'text', 'title'] })
        )
        expect(list!.of!.map((field) => field.name)).toEqual([
            'title',
            'body',
            'image',
        ])
    })

    it('puts a click-through on each item, or on the block when there is no list', () => {
        const listed = fieldsFromAnswers(
            answers({
                shape: 'list',
                itemParts: ['title'],
                actions: ['itemLink'],
            })
        )
        expect(listed.map((field) => field.name)).toEqual(['items'])
        expect(listed[0]!.of!.map((field) => field.name)).toContain('link')
        expect(
            fieldsFromAnswers(
                answers({ shape: 'single', actions: ['itemLink'] })
            )
        ).toEqual([{ name: 'link', type: 'link', required: false }])
    })

    it('makes nothing beyond the intro for a section that needs nothing', () => {
        expect(fieldsFromAnswers(pickJob(blankAnswers(), 'convert'))).toEqual(
            []
        )
    })
})

describe('pickJob', () => {
    it('sets the shape and the parts the job usually has', () => {
        expect(pickJob(blankAnswers(), 'prove')).toMatchObject({
            job: 'prove',
            shape: 'list',
            itemParts: ['number', 'label'],
        })
    })

    it('keeps the author’s parts for a job with none of its own', () => {
        const picked = pickJob(answers({ itemParts: ['title'] }), 'introduce')
        expect(picked.itemParts).toEqual(['title'])
    })
})

describe('guessJob', () => {
    it.each([
        ['pricing', 'compare'],
        ['logo-cloud', 'work'],
        ['timeline', 'story'],
        ['metrics', 'prove'],
        ['code-window', ''],
    ])('%s → %j', (slug, job) => {
        expect(guessJob(slug)).toBe(job)
    })
})

describe('featureBlockIdeas', () => {
    it('offers blocks the signature features name but nobody planned', () => {
        const brief = exampleBrief()
        brief.features = [
            {
                text: 'A ledger of plans',
                kind: 'block',
                ref: 'driftwire.pricing',
            },
            {
                text: 'Changelog as a ship’s log',
                kind: 'block',
                ref: 'a driftwire.log-book block',
            },
            { text: 'Same again', kind: 'block', ref: 'driftwire.log-book' },
        ]
        expect(featureBlockIdeas(brief)).toEqual([
            {
                slug: 'log-book',
                purpose: 'Changelog as a ship’s log',
                answers: pickJob(blankAnswers(), 'story'),
            },
        ])
    })
})

describe('describeAnswers', () => {
    it('puts the answers in words for Claude', () => {
        expect(
            describeAnswers({
                ...pickJob(blankAnswers(), 'prove'),
                special: ' ruled like a logbook ',
            })
        ).toBe(
            'Its job: prove it with numbers. It holds a list of similar items. Each item has: number or figure, label. The author adds: “ruled like a logbook”'
        )
        expect(describeAnswers(blankAnswers())).toBe('')
    })
})
