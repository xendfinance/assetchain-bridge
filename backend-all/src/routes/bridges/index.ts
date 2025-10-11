import { type Request } from 'express'
import type { Resource } from 'express-automatic-routes'
import { bridgeService} from '@/services'
// import axios from 'axios'

export default (): Resource => ({
  async get(req: Request<{}, {}, {}, {}>, res) {
    try {

      const response = await bridgeService.getAllBridges()
      res.status(200).json({
        success: true,
        data: response,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
})
