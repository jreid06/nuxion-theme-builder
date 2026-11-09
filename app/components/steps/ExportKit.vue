<script setup lang="ts">
import { exportKit } from '~/services/export/kit'
import { downloadText } from '~/services/utils/dom'

const store = useBriefStore()

const kit = computed(() => exportKit(store.brief))
const current = computed(
    () =>
        kit.value.find((item) => item.key === store.exportKey) ?? kit.value[0]!
)
</script>

<template>
    <SectionBlock
        title="What you’re exporting"
        note="Four things. Choose one to see what it contains, then copy or download it."
    >
        <div class="kinds four">
            <button
                v-for="item in kit"
                :key="item.key"
                type="button"
                class="kind"
                :class="{ on: store.exportKey === item.key }"
                :aria-pressed="store.exportKey === item.key"
                @click="store.exportKey = item.key"
            >
                <h3 class="mono">{{ item.label }}</h3>
                <p>{{ item.job }}</p>
                <dl>
                    <dt>WHERE IT GOES</dt>
                    <dd>{{ item.destination }}</dd>
                </dl>
            </button>
        </div>
        <StudioOptions v-if="current.key === 'studio'" />
        <div class="two">
            <div>
                <span class="flabel">Filled in from your answers</span>
                <ul>
                    <li v-for="line in current.filled" :key="line">
                        {{ line }}
                    </li>
                </ul>
            </div>
            <div>
                <span class="flabel">Left for you</span>
                <ul>
                    <li v-for="line in current.leftForYou" :key="line">
                        {{ line }}
                    </li>
                </ul>
            </div>
        </div>
        <div class="out-head">
            <span class="mono hint min-w-0 break-words">{{
                current.destination
            }}</span>
            <div class="flex gap-1.5">
                <CopyButton
                    :text="current.text"
                    :label="`Copy ${current.label}`"
                    primary
                />
                <button
                    class="btn sm"
                    type="button"
                    @click="downloadText(current.filename, current.text)"
                >
                    Download
                </button>
            </div>
        </div>
        <pre class="out" tabindex="0">{{ current.text }}</pre>
    </SectionBlock>
</template>
