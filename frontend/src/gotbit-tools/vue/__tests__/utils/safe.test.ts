import { expect, describe, it } from 'vitest'

import { safe, safeRead, safeWrite } from '../../utils/safe'
import { makeTx, makePromise } from '../test-utils'

describe('`utils/safe.ts` test', () => {
  describe('`safeRead` function', () => {
    it('should return the result if the promise is resolved', async () => {
      const data = { some: 'data' }
      const defaultValue = { some: 'default' }
      const result = await safeRead(makePromise(true, data), defaultValue)
      expect(result, 'Real data').eq(data)
    })
    it('should return default value if the promise is rejected', async () => {
      const data = { some: 'data' }
      const defaultValue = { some: 'default' }
      const result = await safeRead(makePromise(false, data), defaultValue)
      expect(result, 'Default data').eq(defaultValue)
    })
    it('should execute error callback if the promise is rejected', async () => {
      const data = { some: 'data' }
      const defaultValue = { some: 'default' }
      let callback = false
      const result = await safeRead(
        makePromise(false, data),
        defaultValue,
        () => (callback = true),
      )
      expect(result, 'Default data').eq(defaultValue)
      expect(callback, 'Callback was triggered').true
    })
    it('should not execute error callback if the promise is resolved', async () => {
      const data = { some: 'data' }
      const defaultValue = { some: 'default' }
      let callback = false
      const result = await safeRead(
        makePromise(true, data),
        defaultValue,
        () => (callback = true),
      )
      expect(result).eq(data)
      expect(callback, 'Callback was not triggered').false
    })
  })
  describe('`safe` function', () => {
    it('should return the result and null as error if the promise is resolved', async () => {
      const data = { some: 'data' }
      const [result, error] = await safe(makePromise(true, data))
      expect(result, 'Real data').eq(data)
      expect(error, 'Error is null').null
    })
    it('should return null as result and error if the promise is rejected', async () => {
      const data = { some: 'data' }
      const [result, error] = await safe(makePromise(false, data))
      expect(result, 'Result is null').null
      expect(error, 'Some error').not.null
    })
  })
  describe('`safeWrite` function', () => {
    it('should waits tx if the promise is resolved', async () => {
      const [tx, rpt] = await safeWrite(makeTx(true))
      expect(rpt).true
      expect(tx).not.null
    })
    it('should return [null, null] if the promise is rejected', async () => {
      const [tx, rpt] = await safeWrite(makeTx(false))
      expect(rpt).eq(tx).null
    })
    it('should execute error callback if the promise is rejected', async () => {
      let callback = false
      const [tx, rpt] = await safeWrite(makeTx(false), () => (callback = true))
      expect(callback, 'Callback was triggered').true
    })
    it('should not execute error callback if the promise is resolved', async () => {
      let callback = false
      const [tx, rpt] = await safeWrite(makeTx(true), () => (callback = true))
      expect(callback, 'Callback was not triggered').false
    })
  })
})
