import { blankAnswers, type BlockAnswers } from '~/services/brief/model'
import {
    ACTIONS,
    ITEM_PARTS,
    JOBS,
    SECTION_PARTS,
    SHAPES,
} from '~/services/inspire/blockInterview'

const ids = (options: { id: string }[]) => options.map((option) => option.id)

/** Every job and shape, bare and with every part ticked. */
export const everyAnswer: BlockAnswers[] = JOBS.flatMap((job) =>
    ids(SHAPES).flatMap((shape) => {
        const base = {
            ...blankAnswers(),
            job: job.id,
            shape: shape as BlockAnswers['shape'],
        }
        return [
            base,
            {
                ...base,
                itemParts: ids(ITEM_PARTS),
                sectionParts: ids(SECTION_PARTS),
                actions: ids(ACTIONS),
            },
        ]
    })
)
