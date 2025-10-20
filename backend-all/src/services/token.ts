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
import {
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TokenAccountNotFoundError,
} from '@solana/spl-token'
import { getSolanaConnection, SOL_CHAIN_BUFFER, SOLANA_PROGRAM_VERSION, solanaWorkspace } from '@/utils/solana/helpers'

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
      if (symbol.toLowerCase() === 'xrwa') {
        symbol = 'RWA'
      }
      if (symbol === 'USD₮0' || symbol === 'USDT0') symbol = 'USDT'
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

  async getTokenBalance(
    evmAddress: string,
    solanaAddess: string,
    _tokens: {
      chainId: ChainId
      tokenAddress: string
      bridgeAssist: string
      checkAmountCanBridge: boolean
      targetBlockTag: number,
      symbol: string
    }[]
  ) {
    const providers = new Map<ChainId, providers.JsonRpcProvider>()
    await Promise.all(
      _tokens.map(async (token) => {
        if (isSolChain(token.chainId)) {
          return
        } else {
          providers.set(token.chainId, await _getProvider(token.chainId))
        }
      })
    )
    const tokenBalances: any = {}
    
    await Promise.all(
      _tokens.map(async (token) => {
        if (isSolChain(token.chainId)) {
          if (!solanaAddess) return
          const connection = getSolanaConnection(token.chainId)
          const tokenBalancePromise = this.getSolanaTokenBalance(
            solanaAddess,
            token.tokenAddress,
            connection
          )
          
          const bridgeBalancePromise = this.getBridgeTokenBalance(
            token.bridgeAssist,
            token.tokenAddress,
            connection
          )
          const [tokenBalance, bridgeBalance] = await Promise.all([
            tokenBalancePromise,
            bridgeBalancePromise,
          ])
          if (!tokenBalances[token.chainId]) {
            tokenBalances[token.chainId] = []
          }
          const realUserTokenBalance = tokenBalance ? tokenBalance.amount.toString() : '0'
          const realTBridgeBalance = bridgeBalance ? bridgeBalance.amount.toString() : '0'
          tokenBalances[token.chainId].push({
            tokenAddress: token.tokenAddress,
            userBalance: realUserTokenBalance,
            bridgeBalance: realTBridgeBalance,
            amountCanBridge: realUserTokenBalance,
            symbol: token.symbol
          })
          return
        } else {
          if (!evmAddress) return
          if (!tokenBalances[token.chainId]) {
            tokenBalances[token.chainId] = []
          }
          if (token.tokenAddress === '0x0000000000000000000000000000000000000001') {
            const provider = providers.get(token.chainId)!
            const userBalancePromise = provider.getBalance(evmAddress)
            const bridgeBalancePromise = provider.getBalance(token.bridgeAssist)

            const [userBalance, bridgeBalance] = await Promise.all([
              userBalancePromise,
              bridgeBalancePromise,
            ])

            tokenBalances[token.chainId].push({
              tokenAddress: token.tokenAddress,
              userBalance: userBalance.toString(),
              bridgeBalance: bridgeBalance.toString(),
              amountCanBridge: userBalance.toString(),
              symbol: token.symbol
            })
            return
          }
          const _token = anyToken(token.tokenAddress, providers.get(token.chainId)!)
          const userBalancePromise = _token.balanceOf(evmAddress)
          const bridgeBalancePromise = _token.balanceOf(token.bridgeAssist)
          const [userBalance, bridgeBalance] = await Promise.all([
            userBalancePromise,
            bridgeBalancePromise,
          ])
          let amountCanBridge = userBalance
          if (token.checkAmountCanBridge) {
            amountCanBridge = await _token.balanceOf(evmAddress, {
              blockTag: token.targetBlockTag,
            })
          }
          tokenBalances[token.chainId].push({
            tokenAddress: token.tokenAddress,
            userBalance: userBalance.toString(),
            bridgeBalance: bridgeBalance.toString(),
            amountCanBridge: amountCanBridge.toString(),
            symbol: token.symbol
          })
        }
      })
    )
    return tokenBalances
  }

  async getTokenAllowance(
    evmAddress: string,
    spenderAddress: string,
    token: { chainId: ChainId; tokenAddress: string }
  ) {
    const provider = await _getProvider(token.chainId)
    const _token = anyToken(token.tokenAddress, provider)
    const allowance = await _token.allowance(evmAddress, spenderAddress)
    return {
      tokenAddress: token.tokenAddress,
      allowance: allowance.toString(),
      chainId: token.chainId,
      evmAddress,
      spenderAddress,
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

  async getSolanaTokenBalance(
    ownerAddress: string,
    mintAddress: string,
    connection: Connection
  ) {
    const ownerPublicKey = new PublicKey(ownerAddress)
    const mintPublicKey = new PublicKey(mintAddress)

    // Find the associated token account (ATA)
    const ata = await getAssociatedTokenAddress(mintPublicKey, ownerPublicKey)

    try {
      const accountInfo = await getAccount(connection, ata)
      // console.log(accountInfo, "accountInfo");

      return accountInfo
      //   console.log("Balance:", Number(accountInfo.amount) / Math.pow(10, accountInfo.decimals));
    } catch (err: any) {
      if (err instanceof TokenAccountNotFoundError) {
        return null
      }
      throw err
    }
  }

  async getBridgeTokenBalance(
    bridgeAddress: string,
    mintAddress: string,
    connection: Connection
  ) {
    const tokenMint = new PublicKey(mintAddress);
    const {owner} = solanaWorkspace(bridgeAddress, mintAddress)
    const programId = new PublicKey(bridgeAddress)
  
    const [bridgeTokenPda] = PublicKey.findProgramAddressSync(
      [
        SOLANA_PROGRAM_VERSION().toBuffer('be', 8),
        Buffer.from("wallet"),
        owner.publicKey.toBuffer(),
        tokenMint.toBuffer(),
        SOL_CHAIN_BUFFER(),
      ],
      programId
    );
  
    // Find the associated token account (ATA)
  
    try {
      const accountInfo = await getAccount(connection, bridgeTokenPda);
      // console.log(accountInfo, "accountInfo");
  
      return accountInfo
      //   console.log("Balance:", Number(accountInfo.amount) / Math.pow(10, accountInfo.decimals));
    } catch (err: any) {
      if (err instanceof TokenAccountNotFoundError) {
        return null
      }
      throw err;
    }
  }
}
