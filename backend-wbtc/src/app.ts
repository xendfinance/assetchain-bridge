import express from 'express'
import path from 'path'

import cors from 'cors'
import morgan from 'morgan'

import autoroutes from 'express-automatic-routes'
import 'module-alias/register'

import * as dotenv from 'dotenv'
dotenv.config()

import config from '@/config'

const app = express()

app.use(express.json()).use(cors()).use(morgan(config.morganLogger))

autoroutes(app, {
  dir: path.join(__dirname, 'routes'),
})

if (!process.env.TEST)
  app.listen(config.port, () => {
    console.log(`Server started on port the ${config.port}`)
    console.log(`DEBUG=${process.env.DEBUG}`)
  })

export default app
