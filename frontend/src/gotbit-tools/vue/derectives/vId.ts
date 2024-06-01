import type { Directive } from 'vue'

export const vId: Directive<HTMLElement, string> = (el, binding) => {
  if (import.meta.env.VITE_DEBUG === 'true') el.setAttribute('data-testid', binding.value)
}
