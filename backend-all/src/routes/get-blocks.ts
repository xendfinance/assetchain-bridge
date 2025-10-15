import {query, type Request } from 'express'
import type { Resource } from 'express-automatic-routes'

import { getBlockNumber } from '@/services/blockchain'
import { ChainId } from '@/gotbit-tools/node/types'
// import axios from 'axios'

export default (): Resource => ({
  async get(req: Request<{}, {}, {}, { }>, res) {
    try {
      const chainIds : string  = (req.query as any).chainIds

      if (!chainIds) return res.status(400).send('chainIds not specified')

      const chainIdsArray = chainIds.split(',')

      const blockNumbers = await getBlockNumber(chainIdsArray as ChainId[])

      res.status(200).json({ success: true, data: blockNumbers })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
})
