import { expect, describe, beforeEach, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useUI } from '@/store/ui'

describe('UI Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })
  it('should init ui store', () => {
    const ui = useUI()
  })
})
