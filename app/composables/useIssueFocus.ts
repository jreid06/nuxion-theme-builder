import { nextTick } from 'vue'
import type { Issue } from '~/services/brief/checks'

/** Takes the author to the field a Readiness issue is about. */
export const useIssueFocus = () => {
    const store = useBriefStore()

    return async (issue: Issue) => {
        store.stepId = issue.step
        await nextTick()
        const target = document.querySelector<HTMLElement>(
            `[data-field="${issue.field}"]`
        )
        if (!target) return
        target.scrollIntoView({ block: 'center' })
        target.classList.remove('flash')
        void target.offsetWidth
        target.classList.add('flash')
        target
            .querySelector<HTMLElement>('input, select, textarea, button')
            ?.focus({ preventScroll: true })
    }
}
