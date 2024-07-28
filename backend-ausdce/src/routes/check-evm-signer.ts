import { getWalletEVM } from '@/services/blockchain'
import { Resource } from 'express-automatic-routes'

export default (): Resource => ({
  get(_, res) {
    try {
      const signer = getWalletEVM().address
      res.status(200).json({ success: true, data: { signer } })
    } catch (e) {
      console.error('Error during get evm signer', e)
      res.status(500).send({ success: false, error: 'Error during get evm signer' })
    }
  },
})
