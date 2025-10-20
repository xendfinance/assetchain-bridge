import { tokenService } from '@/services'
import { type Request } from 'express'
import { Resource } from 'express-automatic-routes'
import { ChainId } from '@/gotbit-tools/node/types'
import { GetTokenAllowance } from '@/types'

export default (): Resource => ({
  async get(req: Request<{}, {}, {}, any>, res) {
    try {
      const { evmAddress, spenderAddress, tokenAddress, chainId } = req.query
      if (!evmAddress) return res.status(400).json({ error: 'evmAddress is required' })
      if (!spenderAddress)
        return res.status(400).json({ error: 'spenderAddress is required' })
      if (!tokenAddress)
        return res.status(400).json({ error: 'tokenAddress is required' })
      if (!chainId) return res.status(400).json({ error: 'chainId is required' })
      const response = await tokenService.getTokenAllowance(evmAddress, spenderAddress, {
        tokenAddress,
        chainId: chainId as ChainId,
      })
      res.status(200).json({
        success: true,
        data: response,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
})
