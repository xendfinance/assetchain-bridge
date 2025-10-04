import { type Request } from 'express'
import type { Resource } from 'express-automatic-routes'
import { bridgeService } from '@/services'
// import axios from 'axios'

export default (): Resource => ({
  async get(req: Request<{}, {}, {}, { userAddress?: string }>, res) {
    try {
      if (!req.query.userAddress) {
        return res.status(400).json({ error: 'User address not specified' })
      }
      const response = await bridgeService.getUserTransactions(req.query.userAddress)
      res.status(200).json({
        success: true,
        data: response,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
})
