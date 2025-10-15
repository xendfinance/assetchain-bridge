import { type Request } from 'express'
import type { Resource } from 'express-automatic-routes'
import { tokenService } from '@/services'
import { GetTokenBalances } from '@/types'
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

  async post(req: Request<{}, {}, GetTokenBalances>, res) {
    try {
      if (!req.body.evmAddress) {
        req.body.evmAddress = ''
      }
      if (!req.body.solanaAddress) {
        req.body.solanaAddress = ''
      }
      if (!req.body.tokens) return res.status(400).json({ error: 'tokens is required' })
      if (!req.body.tokens.length) return res.status(400).json({ error: 'tokens is required' })
      const response = await tokenService.getTokenBalance(
        req.body.evmAddress,
        req.body.solanaAddress,
        req.body.tokens
      )
      res.status(200).json({
        success: true,
        data: response,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
})
