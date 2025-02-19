import type { Request } from 'express'
import type { Resource } from 'express-automatic-routes'

import { signTransaction } from '@/services/blockchain'

export default (): Resource => ({
  async get(
    req: Request<
      {},
      {},
      {},
      {
        fromBridgeAddress?: string
        toBridgeAssistAddress?: string
        fromChain?: string
        fromUser?: string
        index?: string
      }
    >,
    res
  ) {
    try {
      const { fromBridgeAddress, toBridgeAssistAddress, fromChain, fromUser, index } =
        req.query
      if (!fromBridgeAddress)
        return res.status(400).send('fromBridgeAddress not specified')
      if (!toBridgeAssistAddress)
        return res.status(400).send('toBridgeAssistAddress not specified')
      if (!fromChain) return res.status(400).send('from chain not specified')
      if (!fromUser) return res.status(400).send('from user not specified')
      if (!index) return res.status(400).send('index not specified')
      console.log(fromBridgeAddress, toBridgeAssistAddress, fromChain, fromUser, index)
      const signature = await signTransaction(
        fromBridgeAddress,
        toBridgeAssistAddress,
        fromChain,
        fromUser,
        index
      )
      res.status(200).json({ signature })
    } catch (error: any) {
      throw new Error(error.message)
    }
  },
})
