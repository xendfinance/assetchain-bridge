import type { Request } from 'express'
import type { Resource } from 'express-automatic-routes'

import { signTransaction } from '@/services/blockchain'
import { GetTransactionSignationDto } from '@/types'

export default (): Resource => ({
  async get(req: Request<{}, {}, {}, GetTransactionSignationDto>, res) {
    try {
      const { fromBridgeAddress, toBridgeAssistAddress, fromChain, fromUser, index } =
        req.query
      console.log(fromBridgeAddress, toBridgeAssistAddress, fromBridgeAddress, fromChain, index, 'tracking param')
      if (!fromBridgeAddress)
        return res.status(400).send('fromBridgeAddress not specified')
      if (!toBridgeAssistAddress)
        return res.status(400).send('toBridgeAssistAddress not specified')
      if (!fromChain) return res.status(400).send('from chain not specified')
      if (!fromUser) return res.status(400).send('from user not specified')
      if (!index) return res.status(400).send('index not specified')
      const signature = await signTransaction(
        fromBridgeAddress,
        toBridgeAssistAddress,
        fromChain,
        fromUser,
        index
      )
      console.log(signature);
      res.status(200).json({ signature })
    } catch (error: any) {
      console.log(error);
      res.status(400).json({ error: error.message })
    }
  },
})
