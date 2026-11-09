<script setup lang="ts">
import { sitePreview } from '~/services/preview/sitePreview'

const store = useBriefStore()

const scheme = computed(() =>
    store.brief.dark === 'full' ? store.previewScheme : 'light'
)
const site = computed(() =>
    sitePreview(store.brief, scheme.value, store.previewWidth)
)
const brandName = computed(() => store.brief.title || 'Your theme')

const stage = useTemplateRef('stage')
const inner = useTemplateRef('inner')
const stageWidth = ref(380)
const innerHeight = ref(600)

const scale = computed(() => Math.min(1, stageWidth.value / store.previewWidth))

let observer: ResizeObserver | undefined
onMounted(() => {
    observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
            if (entry.target === stage.value) {
                stageWidth.value = entry.contentRect.width
            } else {
                innerHeight.value = entry.contentRect.height
            }
        }
    })
    if (stage.value) observer.observe(stage.value)
    if (inner.value) observer.observe(inner.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
    <div
        ref="stage"
        class="pv-stage"
        :style="{
            width: `${store.previewWidth}px`,
            height: `${Math.ceil(innerHeight * scale)}px`,
            background: site.canvas.bg,
        }"
    >
        <div
            ref="inner"
            class="pv-site"
            :style="{
                ...site.body,
                width: `${store.previewWidth}px`,
                transform: `scale(${scale})`,
                color: site.canvas.text,
                background: site.canvas.bg,
            }"
        >
            <div
                class="pv-nav"
                :style="{ background: site.nav.bg, color: site.nav.text }"
            >
                <b :style="{ fontFamily: site.headingFont }">{{ brandName }}</b>
                <span v-for="link in site.navLinks" :key="link">{{
                    link
                }}</span>
                <span v-if="site.phone">Menu</span>
            </div>

            <div
                class="pv-sec"
                :style="{
                    padding: site.sectionPadding,
                    background: site.canvas.bg,
                    color: site.canvas.text,
                }"
            >
                <div class="pv-in" :style="{ maxWidth: site.maxWidth }">
                    <div
                        class="pv-hero"
                        :style="{
                            gridTemplateColumns: site.phone
                                ? '1fr'
                                : '1.15fr 1fr',
                        }"
                    >
                        <div class="pv-in">
                            <div
                                v-if="site.eyebrow"
                                :style="{
                                    ...site.eyebrow,
                                    color: site.canvas.accent,
                                }"
                            >
                                New release
                            </div>
                            <div :style="site.h1">
                                {{
                                    store.brief.headline ||
                                    'Your longest headline goes here'
                                }}
                            </div>
                            <div class="opacity-85">
                                {{
                                    store.brief.mood ||
                                    'A sentence about the product.'
                                }}
                            </div>
                            <div class="pv-btns">
                                <span
                                    v-for="button in site.heroButtons"
                                    :key="button.label"
                                    class="pv-b"
                                    :style="button.style"
                                >
                                    {{ button.label }}
                                </span>
                            </div>
                        </div>
                        <div
                            class="pv-art"
                            :style="{
                                borderRadius: site.mediaRadius,
                                boxShadow: site.mediaShadow,
                                minHeight: site.phone ? '120px' : '280px',
                                background: site.raised.bg,
                            }"
                        >
                            <i
                                v-for="swatch in site.art"
                                :key="swatch.id"
                                :style="{ background: swatch.hex }"
                            ></i>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="pv-sec"
                :style="{
                    padding: site.sectionPadding,
                    background: site.raised.bg,
                    color: site.raised.text,
                }"
            >
                <div class="pv-in" :style="{ maxWidth: site.maxWidth }">
                    <div :style="site.h2">Built for this canvas</div>
                    <div
                        class="pv-cols"
                        :style="{
                            gridTemplateColumns: site.phone
                                ? '1fr'
                                : 'repeat(3, 1fr)',
                        }"
                    >
                        <div
                            v-for="feature in site.features"
                            :key="feature"
                            class="pv-card"
                            :style="{
                                borderRadius: site.cardRadius,
                                background: site.canvas.bg,
                                color: site.canvas.text,
                            }"
                        >
                            <div :style="site.h4">{{ feature }}</div>
                            <div class="text-[.92em] opacity-80">
                                Card radius, ground and text all come from your
                                tokens.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                class="pv-sec"
                :style="{
                    padding: site.closingPadding,
                    background: site.canvas.bg,
                }"
            >
                <div
                    class="pv-in"
                    :style="{
                        maxWidth: site.maxWidth,
                        padding: site.phone ? '32px 20px' : '56px',
                        borderRadius: site.panelRadius,
                        background: site.night.bg,
                        color: site.night.text,
                    }"
                >
                    <div :style="site.h2">Closing call to action</div>
                    <div class="pv-btns">
                        <span
                            v-if="site.closingButton"
                            class="pv-b"
                            :style="site.closingButton.style"
                        >
                            {{ site.closingButton.label }}
                        </span>
                    </div>
                </div>
            </div>

            <div
                class="pv-nav pv-foot"
                :style="{ background: site.footer.bg, color: site.footer.text }"
            >
                <b :style="{ fontFamily: site.headingFont }">{{ brandName }}</b>
                <span>Footer links</span>
            </div>
        </div>
    </div>
</template>
