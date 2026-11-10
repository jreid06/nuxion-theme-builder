<script setup lang="ts">
import { briefFile } from '~/services/brief/persistence'
import { describeEdited, summariseBrief } from '~/services/brief/summary'
import { canvasTextMeasure, downloadText } from '~/services/utils/dom'

const store = useBriefStore()

const now = ref(Date.now())
let ticker: ReturnType<typeof setInterval> | undefined
onMounted(() => {
    store.refreshLibrary()
    ticker = setInterval(() => (now.value = Date.now()), 60_000)
})
onBeforeUnmount(() => clearInterval(ticker))

const cards = computed(() => {
    void store.fontVersion
    return store.library.map((saved) =>
        summariseBrief(saved, canvasTextMeasure)
    )
})

const deleting = ref<string | null>(null)
const openError = ref('')

const download = (id: string) => {
    const saved = store.library.find((item) => item.id === id)
    if (!saved) return
    const { filename, text } = briefFile(saved.brief)
    downloadText(filename, text)
}

const remove = (id: string) => {
    store.remove(id)
    deleting.value = null
}

const addFile = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    openError.value = store.openFile(await file.text()) ?? ''
    input.value = ''
}
</script>

<template>
    <main class="library">
        <div class="lib-head">
            <div class="step-head">
                <h1>Your briefs</h1>
                <p>
                    Pick up where you left off, or start a new theme. Every
                    brief saves in this browser as you type.
                </p>
            </div>
            <div class="actions">
                <button
                    class="btn pri"
                    type="button"
                    @click="store.startBlank()"
                >
                    New blank brief
                </button>
                <button class="btn" type="button" @click="store.loadExample()">
                    Start from the Driftwire example
                </button>
                <label class="btn" for="library-file"
                    >Add a downloaded brief</label
                >
                <input
                    id="library-file"
                    class="sr-only"
                    type="file"
                    accept="application/json,.json"
                    @change="addFile"
                />
            </div>
        </div>

        <div v-if="openError" class="step-issues" role="alert">
            <div class="iss error">
                <i class="dot error"></i><span>{{ openError }}</span>
            </div>
        </div>
        <div v-if="!store.storageAvailable" class="tip">
            This browser isn’t letting the app save. You can still work on a
            brief, but download it from Review and export before you close the
            tab.
        </div>

        <div v-if="!cards.length" class="empty lib-empty">
            No saved briefs yet. Start a blank one, or open the Driftwire
            example to see what a finished brief looks like.
        </div>

        <ul v-else class="lib-grid" aria-label="Saved briefs">
            <li v-for="card in cards" :key="card.id" class="lib-card">
                <div class="strip" aria-hidden="true">
                    <i
                        v-for="(colour, index) in card.colours"
                        :key="index"
                        :style="{ background: colour }"
                    ></i>
                    <i v-if="!card.colours.length" class="no-colours"></i>
                </div>
                <div class="lib-title">
                    <h2>{{ card.title }}</h2>
                    <span class="tag">{{ card.status }}</span>
                    <span v-if="card.example" class="tag">Example</span>
                </div>
                <p v-if="card.codename || card.direction" class="lib-meta">
                    <span v-if="card.codename" class="mono">{{
                        card.codename
                    }}</span>
                    <span v-if="card.codename && card.direction"> · </span>
                    <span v-if="card.direction">{{ card.direction }}</span>
                </p>
                <p v-if="card.mood" class="lib-mood">{{ card.mood }}</p>
                <div class="chips">
                    <span
                        class="tag"
                        :class="{ ok: card.stepsDone === card.stepsTotal }"
                    >
                        {{ card.stepsDone }} of {{ card.stepsTotal }} steps
                    </span>
                    <span v-if="card.blocking" class="tag bad">
                        {{ card.blocking }} blocking
                    </span>
                    <span v-if="card.toReview" class="tag warn">
                        {{ card.toReview }} to review
                    </span>
                </div>
                <p class="hint">{{ describeEdited(card.updatedAt, now) }}</p>

                <div
                    v-if="deleting === card.id"
                    class="lib-confirm"
                    role="group"
                >
                    <span
                        >Delete “{{ card.title }}”? This can’t be undone.</span
                    >
                    <div class="actions">
                        <button
                            class="btn sm danger"
                            type="button"
                            @click="remove(card.id)"
                        >
                            Delete
                        </button>
                        <button
                            class="btn sm ghost"
                            type="button"
                            @click="deleting = null"
                        >
                            Keep it
                        </button>
                    </div>
                </div>
                <div v-else class="actions">
                    <button
                        class="btn sm pri"
                        type="button"
                        :aria-label="`Open ${card.title}`"
                        @click="store.openBrief(card.id)"
                    >
                        Open
                    </button>
                    <button
                        class="btn sm"
                        type="button"
                        @click="store.duplicate(card.id)"
                    >
                        Duplicate
                    </button>
                    <button
                        class="btn sm"
                        type="button"
                        @click="download(card.id)"
                    >
                        Download
                    </button>
                    <button
                        class="btn sm ghost"
                        type="button"
                        @click="deleting = card.id"
                    >
                        Delete
                    </button>
                </div>
            </li>
        </ul>
    </main>
</template>
