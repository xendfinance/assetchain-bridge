import { expect, describe, it } from 'vitest'
import '../../types/bignumber'
import { BigNumber } from 'ethers'

describe('BigNumber extension test', () => {
  describe('`formatString` function', () => {
    it('should pass', () => {
      const tests: {
        input: BigNumber
        output: string
        options: Parameters<BigNumber['formatString']>
      }[] = [
        { input: BigNumber.from('1000000000000000000'), output: '1', options: [] },
        { input: BigNumber.from('100000000000000000'), output: '0.1', options: [] },
        { input: BigNumber.from('1100000000000000000'), output: '1.1', options: [] },
        { input: BigNumber.from('1'), output: '0.000000000000000001', options: [] },
        {
          input: BigNumber.from('1000000000000000001'),
          output: '1.000000000000000001',
          options: [],
        },
        {
          input: BigNumber.from('1100000000000000001'),
          output: '1.100000000000000001',
          options: [],
        },
        {
          input: BigNumber.from('10000000000000000000000000000100000000000000001'),
          output: '10000000000000000000000000000.100000000000000001',
          options: [],
        },
        {
          input: BigNumber.from('10000000000000000000000000000000000000000000000'),
          output: '10000000000000000000000000000',
          options: [],
        },
        {
          input: BigNumber.from('1'),
          output: '1',
          options: [0],
        },
        {
          input: BigNumber.from('10000000000000000000'),
          output: '10000000000000000000',
          options: [0],
        },
        { input: BigNumber.from('1000000000000000000'), output: '1', options: [18, 0] },
        { input: BigNumber.from('100000000000000000'), output: '0', options: [18, 0] },
        { input: BigNumber.from('1100000000000000000'), output: '1', options: [18, 0] },
        { input: BigNumber.from('1'), output: '0', options: [18, 0] },
        {
          input: BigNumber.from('1000000000000000001'),
          output: '1',
          options: [18, 0],
        },
        {
          input: BigNumber.from('1100000000000000001'),
          output: '1',
          options: [18, 0],
        },
        {
          input: BigNumber.from('10000000000000000000000000000100000000000000001'),
          output: '10000000000000000000000000000',
          options: [18, 0],
        },
        {
          input: BigNumber.from('10000000000000000000000000000000000000000000000'),
          output: '10000000000000000000000000000',
          options: [18, 0],
        },
        {
          input: BigNumber.from('1000000000000000000'),
          output: '1',
          options: [18, 18, false, ','],
        },
        {
          input: BigNumber.from('100000000000000000'),
          output: '0,1',
          options: [18, 18, false, ','],
        },
        {
          input: BigNumber.from('1100000000000000000'),
          output: '1,1',
          options: [18, 18, false, ','],
        },
        {
          input: BigNumber.from('1'),
          output: '0,000000000000000001',
          options: [18, 18, false, ','],
        },
        {
          input: BigNumber.from('1000000000000000001'),
          output: '1,000000000000000001',
          options: [18, 18, false, ','],
        },
        {
          input: BigNumber.from('1100000000000000001'),
          output: '1,100000000000000001',
          options: [18, 18, false, ','],
        },
        {
          input: BigNumber.from('10000000000000000000000000000100000000000000001'),
          output: '10000000000000000000000000000,100000000000000001',
          options: [18, 18, false, ','],
        },
        {
          input: BigNumber.from('10000000000000000000000000000000000000000000000'),
          output: '10000000000000000000000000000',
          options: [18, 18, false, ','],
        },
      ]

      for (const test of tests)
        expect(test.input.formatString(...test.options)).eq(test.output)
    })
  })
})
