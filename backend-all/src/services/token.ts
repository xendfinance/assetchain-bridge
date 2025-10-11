import { ChainId } from '@/gotbit-tools/node/types'
import { tokenRepo } from '@/lib/database'
import EventLogger from '@/lib/logger/index.logger'
import { BRIDGEASSISTS, tokenSymbols } from '@/utils/constant'
import { _getProvider, isSolChain } from '@/utils/helpers'
import { anyToken } from '@/utils/useContracts'
import { providers, utils } from 'ethers'
import { In } from 'typeorm'
import { bridgeService } from '.'
import { clusterApiUrl, Connection, PublicKey } from '@solana/web3.js'
import { getMint } from '@solana/spl-token'

export class TokenService {
  async addToken(
    tokenAddress: string,
    chainId: ChainId,
    provider: providers.JsonRpcProvider
  ) {
    try {
      EventLogger.info(`tokenAddress ${tokenAddress}`)
      EventLogger.info(`chain Id ${chainId}`)
      const existingToken = await tokenRepo.findOne({ chainId, tokenAddress })
      if (existingToken) {
        return existingToken
      }
      if (tokenAddress === '0x0000000000000000000000000000000000000001') {
        const name = chainId === '200810' || chainId === '200901' ? 'Bitcoin' : 'RWA'
        const symbol = chainId === '200810' || chainId === '200901' ? 'BTC' : 'RWA'
        const decimal = 18
        const newToken = await tokenRepo.create({
          tokenAddress,
          chainId,
          symbol,
          decimal,
          name,
        })
        await tokenRepo.save(newToken)
        return newToken
      }
      const token = anyToken(tokenAddress, provider)

      const symbolPromise = token.symbol()
      const decimalsPromise = token.decimals()
      const namePromise = token.name()
      let [symbol, decimals, name] = await Promise.all([
        symbolPromise,
        decimalsPromise,
        namePromise,
      ])
      if (symbol.toLowerCase() === 'xrwa'){
        symbol = 'RWA'
      }
      const newToken = await tokenRepo.create({
        tokenAddress,
        chainId,
        symbol,
        decimal: decimals,
        name,
      })
      await tokenRepo.save(newToken)
      return newToken
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async getTokens() {
    try {
      const chainIds = Object.keys(BRIDGEASSISTS)
      const tokens = await tokenRepo.find({ chainId: In(chainIds) })
      return tokens
    } catch (error) {
      console.error('getTokens error', error)
      throw error
    }
  }

  async seedTokenAndBridges() {
    const chainIds = Object.keys(BRIDGEASSISTS)

    Promise.all(
      chainIds.map(async (chainId) => {
        try {
          const isSolanaChain = isSolChain(chainId)
          if (isSolanaChain) {
            const connection = new Connection(
              chainId === 'sol.mainnet'
                ? clusterApiUrl('mainnet-beta')
                : clusterApiUrl('devnet')
            )
            const bridgeAssists: { bridgeAssist: string; token: string }[] = (
              BRIDGEASSISTS as any
            )[chainId]
            for (let bridgeAssist of bridgeAssists) {
              EventLogger.info(`Seeding token ${bridgeAssist.token} on ${chainId}`)
              const token = await this.addSolanaToken(
                bridgeAssist.token,
                chainId as ChainId,
                connection
              )

              const bridge = await bridgeService.addSolanaBridge(
                bridgeAssist.bridgeAssist,
                chainId as ChainId,
                token
              )
              EventLogger.info(`Done Seeding token ${bridgeAssist.token} on ${chainId}`)
            }
            return
          }
          const provider = await _getProvider(chainId as any)
          const bridgeAssists: { bridgeAssist: string; token: string }[] = (
            BRIDGEASSISTS as any
          )[chainId]

          for (let bridgeAssist of bridgeAssists) {
            EventLogger.info(`Seeding token ${bridgeAssist.token} on ${chainId}`)
            const token = await this.addToken(
              bridgeAssist.token,
              chainId as ChainId,
              provider
            )

            const bridge = await bridgeService.addBridge(
              bridgeAssist.bridgeAssist,
              chainId as ChainId,
              token,
              provider
            )
            EventLogger.info(`Done Seeding token ${bridgeAssist.token} on ${chainId}`)
          }
          EventLogger.info(`Done Seeding tokens on ${chainId}`)
        } catch (error: any) {
          EventLogger.error(`Error seeding for ${chainId} ${error.message}`)
        }
      })
    )

    return {
      success: true,
      message: 'Tokens seeding in progress',
    }
  }

  async getTokenBalanceByBlockTag(
    userAddress: string,
    blockTag: number,
    tokenAddress: string,
    chainId: ChainId
  ) {
    try {
      const provider = await _getProvider(chainId)
      const token = anyToken(tokenAddress, provider)
      const balance = await token.balanceOf(userAddress, { blockTag: +blockTag })
      const decimal = await token.decimals()
      const balanceWithDecimal = utils.formatUnits(balance, decimal)
      return {
        tokenAddress,
        balance: balanceWithDecimal,
        decimal,
        chainId,
      }
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  async addSolanaToken(tokenAddress: string, chainId: ChainId, connection: Connection) {
    try {
      const mintPublicKey = new PublicKey(tokenAddress)
      const accountInfo = await getMint(connection, mintPublicKey)
      const symbol = (tokenSymbols as any)[tokenAddress]
      const newToken = await tokenRepo.create({
        tokenAddress,
        chainId,
        symbol,
        decimal: accountInfo.decimals,
        name: symbol,
      })
      await tokenRepo.save(newToken)
      return newToken
    } catch (error) {
      console.log('Error adding solana token', error)
      throw error
    }
  }
}
