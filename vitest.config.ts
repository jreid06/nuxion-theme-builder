import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

const root = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
    resolve: {
        alias: {
            '~~': root,
            '~': `${root}app`,
        },
    },
    test: {
        environment: 'node',
        include: ['test/**/*.test.ts'],
    },
})
