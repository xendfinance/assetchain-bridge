import 'mocha'
import { expect } from 'chai'

import app from '@/app'
import request from 'supertest'
import { useContracts, getProvider, safeRead, chainIds, safeWrite } from '@/gotbit-tools/node'
import { Wallet, BigNumber } from 'ethers'
import CONFIRMATIONS from '@/confirmations.json'

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const CHAIN_ID_FROM = '97'
const CHAIN_ID_TO = '43113'

async function getTxs(user: string): Promise<any[]> {
  const response = await request(app).get(`/transactions?user=${user}`)
  return JSON.parse(response.text)
}

describe('transactions route', () => {
  it('should update the list of txs', async () => {
    const wallet = new Wallet(process.env.TEST_PRIVATE_KEY!, getProvider(CHAIN_ID_FROM))
    const { bridgeAssist } = useContracts(wallet, CHAIN_ID_FROM)
    const amount = BigNumber.from('1').mul(BigNumber.from('10').pow(18))

    const txs = await getTxs(wallet.address)
    console.log({ txs })
    const timestamp = (await wallet.provider.getBlock('latest')).timestamp
    // const nonce = await bridgeAssist.nonce()
    // const [tx_, txr] = await safeWrite(bridgeAssist.send(amount, wallet.address, 'evm.' + CHAIN_ID_TO))

    // wait until the tx is 100% confirmed
    {
      let block = 0
      // while (txr!.blockNumber + CONFIRMATIONS[CHAIN_ID_FROM] >= block) {
      //   await sleep(10000)
      //   block = (await wallet.provider.getBlock('latest')).number
      // }
    }

    const txs2 = await getTxs(wallet.address)
    console.log({ txs2 })

    const i = txs.length
    expect(i + 1).to.eq(txs2.length)
    expect(txs2[i].fulfilled).to.eq(false)

    const tx = txs2[i].transaction
    expect(tx.amount).to.eq(amount.toString())
    expect(parseInt(tx.timestamp)).to.be.gte(timestamp)
    expect(tx.fromUser.toLowerCase()).to.eq(wallet.address.toLowerCase())
    expect(tx.toUser.toLowerCase()).to.eq(wallet.address.toLowerCase())
    expect(tx.fromChain).to.eq('evm.' + CHAIN_ID_FROM)
    expect(tx.toChain).to.eq('evm.' + CHAIN_ID_TO)
    // expect(tx.nonce).to.eq(nonce.toString())

    // fulfill
    // {
    //   const wallet2 = new Wallet(process.env.TEST_PRIVATE_KEY!, getProvider(CHAIN_ID_TO))
    //   const { bridgeAssist } = useContracts(wallet2, CHAIN_ID_TO)
    //   await safeWrite(bridgeAssist.fulfill(txs2[i].fulfillTransaction, [await signHashedTransaction(txs2[i].fulfillTransaction, CHAIN_ID_TO, bridgeAssist.address)]))
    // }
  })
})
