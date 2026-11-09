import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import facts from '~~/data/nuxion.generated.json'
import { exampleBrief } from '~/services/brief/example'
import { studioDocuments } from '~/services/export/studioContent'
import { collectFacts } from '../../scripts/syncNuxion'

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
})
