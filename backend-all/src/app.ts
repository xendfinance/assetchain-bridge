import 'reflect-metadata'
import express from 'express'
import path from 'path'

import cors from 'cors'
import morgan from 'morgan'

import autoroutes from 'express-automatic-routes'
import 'module-alias/register'

import * as dotenv from 'dotenv'
dotenv.config()

import { config } from '@/config'
import { dbConnection } from '@/lib/database'
import { isPublicRelayer } from './utils/env-var'

const app = express()

app.use(express.json()).use(cors()).use(morgan(config.morganLogger))

autoroutes(app, {
  dir: path.join(__dirname, 'routes'),
})

// Initialize database connection and start server
const startServer = async () => {
  try {
    // Connect to database

    if (isPublicRelayer) {
      await dbConnection.connect()

      // Run migrations on startup (optional - you might want to run them manually)
      await dbConnection.runMigrations()
    }

    if (!process.env.TEST) {
      app.listen(config.port, () => {
        console.log(`Server started on port ${config.port}`)
        console.log(`DEBUG=${process.env.DEBUG}`)
        console.log('Database connected successfully')
      })
    }
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down gracefully...')
  
  
  await dbConnection.disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Shutting down gracefully...')
  
  await dbConnection.disconnect()
  process.exit(0)
})

startServer()

export default app
