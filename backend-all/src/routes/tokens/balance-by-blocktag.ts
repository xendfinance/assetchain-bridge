import { type Request } from 'express'
import type { Resource } from 'express-automatic-routes'
import { tokenService } from '@/services'
import { ChainId } from '@/gotbit-tools/node/types';
// import axios from 'axios'

export default (): Resource => ({
  async get(
    req: Request<
      {},
      {},
      {},
      { userAddress?: string; blockTag?: number; tokenAddress?: string; chainId?: string }
    >,
    res
  ) {
    try {
      const { userAddress, blockTag, tokenAddress, chainId } = req.query
      if (!userAddress)
        return res.status(400).json({ error: 'userAddress not specified' })
      if (!blockTag) return res.status(400).json({ error: 'blockTag not specified' })
      if (!tokenAddress)
        return res.status(400).json({ error: 'tokenAddress not specified' })
      if (!chainId) return res.status(400).json({ error: 'chainId not specified' })
      const response = await tokenService.getTokenBalanceByBlockTag(
        userAddress as string,
        blockTag as number,
        tokenAddress as string,
        chainId as ChainId
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
