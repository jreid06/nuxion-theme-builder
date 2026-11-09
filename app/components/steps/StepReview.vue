<script setup lang="ts">
import { fillNames, QA_GROUPS } from '~/services/brief/content'
import type { OpenQuestion } from '~/services/brief/model'
import { themeName, themeTitle } from '~/services/brief/names'
import { allStudioOptions } from '~/services/export/studioContent'
import { downloadText } from '~/services/utils/dom'

const store = useBriefStore()
const { brief } = storeToRefs(store)

const warnings = computed(() => store.issues.length - store.errorCount)

const QUESTION_COLUMNS = [
    { key: 'question', label: 'Question', width: '3fr' },
    { key: 'owner', label: 'Who decides' },
]
const makeQuestion = (): OpenQuestion => ({ question: '', owner: '' })

const qaLabel = (item: string) =>
    fillNames(item, themeName(brief.value), themeTitle(brief.value)).replace(
        /`/g,
        ''
    )

const saveFile = () =>
    downloadText(
        `${brief.value.name || 'theme'}-brief.json`,
        JSON.stringify(brief.value, null, 2)
    )

const openError = ref('')
const openFile = async (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0]
    if (!file) return
    openError.value = store.openFile(await file.text()) ?? ''
    input.value = ''
}
</script>

<template>
    <div v-if="store.errorCount" class="step-issues">
        <span>
            {{ store.errorCount }} blocking and {{ warnings }} to review. Open
            the Readiness tab to work through them.
        </span>
    </div>
    <div v-else class="none-left">
        Nothing blocking. {{ warnings }} item{{ warnings === 1 ? '' : 's' }} to
        review in Readiness.
    </div>
    <ExportKit />
    <div class="how">
        <h2>What the export doesn’t do</h2>
        <p>
            The export gets you set up. These parts still need you, and the
            steps below say when:
        </p>
        <ul>
            <li v-if="!allStudioOptions(brief)">
                <strong>Studio content you unticked.</strong> You enter it by
                hand in the Studio.
            </li>
            <li>
                <strong>Block layouts.</strong>
                {{
                    brief.blocksOn
                        ? 'The commands create starter files. You write each design.'
                        : 'You get a starter hero. Plan and add the rest when you’re ready.'
                }}
            </li>
            <li>
                <strong>Art and images.</strong> You draw them from the lists in
                your brief.
            </li>
            <li><strong>Your pages.</strong> You build them in the Studio.</li>
        </ul>
    </div>
    <SectionBlock
        title="Your next steps"
        note="Do these in order. The green lines mark what you’ll be able to see at that point. Run commands from your Nuxion repo root."
    >
        <NextStepsList />
    </SectionBlock>
    <SectionBlock title="QA before release">
        <div
            v-for="(group, groupIndex) in QA_GROUPS"
            :key="group.title"
            class="qa-grp"
        >
            <span class="flabel">{{ group.title }}</span>
            <CheckRow
                v-for="(item, itemIndex) in group.items"
                :id="`qa-${groupIndex}-${itemIndex}`"
                :key="item"
                v-model="brief.qa[`${groupIndex}-${itemIndex}`]"
                :label="qaLabel(item)"
            />
        </div>
    </SectionBlock>
    <SectionBlock
        title="Open questions"
        note="Anything the reference leaves ambiguous, and who decides it."
    >
        <EditableRows
            path="questions"
            :rows="brief.questions"
            :columns="QUESTION_COLUMNS"
            :make="makeQuestion"
            add-label="Add question"
            empty="None yet."
        />
    </SectionBlock>
    <SectionBlock
        title="Save or move this brief"
        note="It saves in this browser as you type. Download a copy to back it up or open it elsewhere."
    >
        <div class="flex flex-wrap items-center gap-2">
            <button class="btn" type="button" @click="saveFile">
                Download brief (.json)
            </button>
            <label class="btn" for="open-brief">Open a saved brief</label>
            <input
                id="open-brief"
                class="sr-only"
                type="file"
                accept="application/json,.json"
                @change="openFile"
            />
        </div>
        <div v-if="openError" class="hint" role="alert">{{ openError }}</div>
    </SectionBlock>
</template>
