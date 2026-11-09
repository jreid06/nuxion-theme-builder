import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
    rules: {
        // Row and card components edit the brief object they are handed; the
        // store owns that object, and only reassigning the prop itself is wrong.
        'vue/no-mutating-props': ['error', { shallowOnly: true }],
        // Field components have sensible empty states.
        'vue/require-default-prop': 'off',
        'vue/html-self-closing': 'off',
    },
})
