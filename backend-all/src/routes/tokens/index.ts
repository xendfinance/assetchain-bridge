import { type Request } from 'express'
import type { Resource } from 'express-automatic-routes'
import { tokenService } from '@/services'
// import axios from 'axios'

export default (): Resource => ({
  async get(req: Request<{}, {}, {}, {}>, res) {
    try {

      const response = await tokenService.getTokens()
      res.status(200).json({
        success: true,
        data: response,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
})
