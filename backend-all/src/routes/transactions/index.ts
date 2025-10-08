import { query, type Request } from 'express'
import type { Resource } from 'express-automatic-routes'
import { bridgeService } from '@/services'
import {
  GetUserTransactionDto,
  AddTransactionDto,
  MarkTransactionAsClaimedDto,
} from '@/types'
// import axios from 'axios'

export default (): Resource => ({
  async get(req: Request<{}, {}, {}, any>, res) {
    try {
      let { chainIds, fulfilled, limit, page, userAddress, symbol, forceSync, secondaryAddress } = req.query
      if (!userAddress) {
        return res.status(400).json({ error: 'User address not specified' })
      }
      let _page = 1
      let _limit = 10
      if (page) {
        _page = +page
      }
      if (limit) {
        _limit = +limit
      }
      const options = { page: _page, limit: _limit }
      const response = await bridgeService.getUserTransactions(
        userAddress,
        options,
        secondaryAddress,
        chainIds,
        fulfilled,
        forceSync,
        symbol,
      )
      res.status(200).json({
        success: true,
        data: response,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  async post(req: Request<{}, {}, AddTransactionDto>, res) {
    try {
      const { bridgeId, index, userAddress, transactionHash } = req.body

      // Validate required fields
      if (!bridgeId || !index || !userAddress) {
        return res.status(400).json({
          error: 'Missing required fields: bridgeId, index, userAddress',
        })
      }

      const dto: AddTransactionDto = {
        bridgeId,
        index,
        userAddress,
        transactionHash,
      }

      const response = await bridgeService.addTransaction(dto)

      res.status(201).json({
        success: true,
        data: response,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },

  async put(req: Request<{}, {}, MarkTransactionAsClaimedDto>, res) {
    try {
      const { transactionId, claimTransactionHash, toBridgeId } = req.body
      if (!transactionId || !claimTransactionHash || !toBridgeId) {
        return res
          .status(400)
          .json({
            error:
              'Missing required fields: transactionId, claimTransactionHash, toBridgeId',
          })
      }
      const dto: MarkTransactionAsClaimedDto = {
        transactionId,
        claimTransactionHash,
        toBridgeId,
      }
      const response = await bridgeService.markTransactionAsClaimed(dto)
      res.status(200).json({
        success: true,
        data: response,
      })
    } catch (error: any) {
      res.status(400).json({ error: error.message })
    }
  },
})
