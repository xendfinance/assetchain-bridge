import { Resource } from 'express-automatic-routes'

export default (): Resource => ({
  get(_, res) {
    res.status(200).send('Server is Healthy')
  },
})
