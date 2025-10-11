import { ChainId } from '@/gotbit-tools/node/types'
import EventLogger from '@/lib/logger/index.logger'
import { bridgeService, tokenService } from '@/services'
import { BRIDGEASSISTS } from '@/utils/constant'
import { _getProvider } from '@/utils/helpers'

export async function seedTokenAndBridges() {
  const chainIds = Object.keys(BRIDGEASSISTS)

  await Promise.all(
    chainIds.map(async (chainId) => {
      try {
        const provider = await _getProvider(chainId as any)
        const bridgeAssists: { bridgeAssist: string; token: string }[] = (
          BRIDGEASSISTS as any
        )[chainId]

        for (let bridgeAssist of bridgeAssists) {
          EventLogger.info(`Seeding token ${bridgeAssist.token} on ${chainId}`)
          const token = await tokenService.addToken(
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
}
