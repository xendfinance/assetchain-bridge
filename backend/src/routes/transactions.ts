import type { Request } from 'express'
import type { Resource } from 'express-automatic-routes'

import { getFulfilledTransactions } from '@/services/blockchain'

export default (): Resource => ({
  async get(req: Request<{}, {}, {}, { user?: string }>, res) {
    const { user } = req.query
    if (!user) return res.status(400).send('User not specified')
    const signedTransactions = await getFulfilledTransactions(user).catch(console.error)
    res.status(200).json(signedTransactions)
  },
})
