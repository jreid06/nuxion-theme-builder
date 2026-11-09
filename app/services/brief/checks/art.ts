import type { Brief } from '../model'
import type { Issue } from '.'

export const checkArt = (brief: Brief): Issue[] =>
    brief.art.policy
        ? []
        : [
              {
                  step: 'art',
                  severity: 'warn',
                  field: 'art.policy',
                  message: 'Choose an imagery policy.',
              },
          ]
