<script setup lang="ts">
const claude = useClaudeStore()

const key = ref('')
const remember = ref(false)
const input = useTemplateRef('input')

watch(
    () => claude.sheetOpen,
    async (open) => {
        if (!open) return
        remember.value = claude.remember
        await nextTick()
        input.value?.focus()
    }
)

const connect = async () => {
    if (await claude.connect(key.value, remember.value)) key.value = ''
}

const close = () => {
    claude.sheetOpen = false
}
</script>

<template>
    <div
        v-if="claude.sheetOpen"
        class="scrim"
        @click.self="close"
        @keydown.esc="close"
    >
        <div
            class="sheet"
            role="dialog"
            aria-modal="true"
            aria-labelledby="claude-sheet-title"
        >
            <h2 id="claude-sheet-title">Connect Claude</h2>
            <div v-if="claude.reason" class="tip">{{ claude.reason }}</div>
            <p>
                Claude can suggest wording, draft whole steps and mix palettes,
                reading your concept first. It’s optional: every part of this
                wizard works without it.
            </p>

            <template v-if="claude.connected">
                <div class="none-left">
                    Connected.
                    {{
                        claude.remember
                            ? 'Your key is remembered on this device.'
                            : 'Your key is forgotten when you close this tab.'
                    }}
                </div>
                <div class="actions">
                    <button class="btn" type="button" @click="claude.forget()">
                        Forget my key
                    </button>
                    <button class="btn ghost" type="button" @click="close">
                        Close
                    </button>
                </div>
            </template>
            <form v-else class="compose" @submit.prevent="connect">
                <div class="field">
                    <label for="claude-key">Your Claude API key</label>
                    <input
                        id="claude-key"
                        ref="input"
                        v-model="key"
                        type="password"
                        autocomplete="off"
                        spellcheck="false"
                        placeholder="sk-ant-…"
                    />
                    <div class="hint">
                        It goes straight from this browser to Anthropic. There’s
                        no server of ours in between, and it’s never saved in
                        your brief or exports.
                    </div>
                </div>
                <CheckRow
                    id="claude-remember"
                    v-model="remember"
                    label="Remember on this device"
                    sub="Off means it’s forgotten when you close the tab. Only tick this on a computer you trust."
                />
                <div v-if="claude.error" class="hint" role="alert">
                    {{ claude.error }}
                </div>
                <div class="actions">
                    <button
                        class="btn pri"
                        type="submit"
                        :disabled="claude.checking"
                    >
                        {{ claude.checking ? 'Checking your key' : 'Connect' }}
                    </button>
                    <button class="btn ghost" type="button" @click="close">
                        Close
                    </button>
                </div>
            </form>

            <h2 class="sub">Where do I get a key?</h2>
            <ol>
                <li>
                    Sign in at
                    <a
                        href="https://platform.claude.com"
                        target="_blank"
                        rel="noopener"
                    >
                        platform.claude.com </a
                    >.
                </li>
                <li>Add credit if your account needs it.</li>
                <li>Create an API key and paste it above.</li>
            </ol>
            <h2 class="sub">Does my Claude subscription cover this?</h2>
            <p>
                Not directly. A paid Claude plan and the API are separate
                products, so you need an API key either way. Anthropic says Max,
                Ultra and Team plans include monthly API credits. Pro isn’t
                listed.
            </p>
            <h2 class="sub">What will it cost?</h2>
            <p>
                You pay Anthropic for what you use. As a rough guide, a
                suggestion costs about 2 cents and a drafted step or palette
                about 10 cents.
            </p>
        </div>
    </div>
</template>
