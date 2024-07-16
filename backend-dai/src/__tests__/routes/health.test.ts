import 'mocha'
import { expect } from 'chai'

import app from '@/app'
import request from 'supertest'

describe('health route', () => {
  it('should', async () => {
    const response = await request(app).get('/health')
    expect(response.text).eq('Server is Healthy')
  })
})
