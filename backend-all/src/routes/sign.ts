import { query, type Request } from 'express'
import type { Resource } from 'express-automatic-routes'

import { signTransaction } from '@/services/blockchain'
import { GetTransactionSignationDto } from '@/types'
import axios from 'axios'

export default (): Resource => ({
  async get(req: Request<{}, {}, {}, GetTransactionSignationDto>, res) {
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
      const signature = await signTransaction(
        fromBridgeAddress,
        toBridgeAssistAddress,
        fromChain,
        fromUser,
        index
      )
      if (process.env.IS_PUBLIC_RELAYER === 'true') {
        const signatures: any[] = []
        const relayer1Url = process.env.RELAYER1_URL
        const relayer2Url = process.env.RELAYER2_URL
        // Use Promise.all to fetch signatures in parallel
        const [relayer1Signature, relayer2Signature] = await Promise.all([
          axios.get(relayer1Url, { params: req.query }),
          axios.get(relayer2Url, { params: req.query })
        ]);
        signatures.push(relayer1Signature.data.signature, relayer2Signature.data.signature, signature)
        return res.status(200).json(signatures)
      }
      
      res.status(200).json({signature})
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
})
