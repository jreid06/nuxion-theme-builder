import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import facts from '~~/data/nuxion.generated.json'
import { checkFields, fieldSpec } from '~/services/brief/blockFields'
import { exampleBrief } from '~/services/brief/example'
import { blockField as field, type BlockField } from '~/services/brief/model'
import { fieldsFromAnswers } from '~/services/inspire/blockInterview'
import { studioDocuments } from '~/services/export/studioContent'
import { collectFacts } from '../../scripts/syncNuxion'
import { everyAnswer } from '../support/blockAnswers'

/**
 * Checks this app against a real Nuxion checkout: NUXION_BASE, or a
 * nuxion-base folder beside this one. Skipped when there is neither.
 */
const checkout = path.resolve(process.env.NUXION_BASE ?? '../nuxion-base')
const available = fs.existsSync(path.join(checkout, 'studio/schema.json'))

describe.skipIf(!available)('against a Nuxion checkout', () => {
    it('has an up-to-date facts snapshot (npm run sync:nuxion)', () => {
        expect(collectFacts(checkout)).toEqual(facts)
    })

    it('generates Studio documents the schema accepts', async () => {
        const validator = path.join(checkout, 'scripts/dataset/validate.ts')
        const { validateDataset } = await import(/* @vite-ignore */ validator)
        const schema = JSON.parse(
            fs.readFileSync(path.join(checkout, 'studio/schema.json'), 'utf8')
        )
        const documents = JSON.parse(
            JSON.stringify(studioDocuments(exampleBrief()))
        )
        expect(
            validateDataset(documents, schema, {
                decorators: ['strong', 'em', 'underline', 'code'],
                aliases: {},
            })
        ).toEqual([])
    })

    describe('its scaffolder', async () => {
        const { parseFieldSpec } = await import(
            /* @vite-ignore */ path.join(checkout, 'scripts/scaffold/fields.js')
        )
        const { themeExtras } = await import(
            /* @vite-ignore */ path.join(checkout, 'scripts/scaffold/theme.js')
        )
        /** What `scaffold:component --theme --fields` does with a spec. */
        const accepts = (fields: BlockField[]) => {
            try {
                themeExtras(parseFieldSpec(fieldSpec(fields)))
                return true
            } catch {
                return false
            }
        }

        it('accepts every spec this app writes', () => {
            const specs = [
                ...exampleBrief().blocks.map((block) => block.fields),
                ...everyAnswer.map(fieldsFromAnswers),
            ].filter((fields) => fields.length)
            for (const fields of specs) {
                expect(accepts(fields), fieldSpec(fields)).toBe(true)
            }
        })

        it.each([
            [[field('title', 'string', true), field('photo', 'image')]],
            [
                [
                    field('items', 'list', false, [
                        field('heading'),
                        field('options'),
                    ]),
                ],
            ],
            [[field('buttons', 'link.group')]],
            [[field('')]],
            [[field('Title')]],
            [[field('a'), field('a', 'text')]],
            [[field('heading')]],
            [[field('options')]],
            [[field('buttons')]],
            [[field('a', 'widget')]],
            [[field('items', 'list', false, [])]],
            [
                [
                    field('items', 'list', false, [
                        field('in', 'list', false, [field('a')]),
                    ]),
                ],
            ],
            [[field('items', 'list', false, [field('b'), field('b')])]],
        ])('refuses exactly what checkFields flags: %j', (fields) => {
            expect(accepts(fields)).toBe(checkFields(fields).length === 0)
        })
    })
})
