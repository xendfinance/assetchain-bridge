import { useWeb3 } from '@/gotbit-tools/vue'
import { useBridge } from '@/store/contracts/bridge'
import { useUIBridge } from '@/store/ui/bridge'
import { useDialogs } from '@/store/ui/dialogs'

import type { FulfillTx } from '@/api/types'
import { ChainId } from '@/gotbit-tools/vue/types'
import { ContractTransaction } from 'ethers'

import { claimDialog, Dialog, enableDialog, transferDialog } from '@/misc/dialogTexts'
import { createWaiter, formatDialog } from '@/misc/formatDialog'
import { formatDate } from '@/misc/utils'
import { computed, ref } from 'vue'
import { useToken } from '../contracts/token'
import { useFactory } from '../contracts/factory'

export const useBridgeRead = () => {
  const token = useToken()
  const bridge = useBridge()
  const factory = useFactory()

  return {
    history: () => {
      return bridge.histories.length
        ? bridge.histories
            .filter((tx) => tx.symbol === token.symbol)
            .reverse()
            .map((h) => ({
              transactionCard: {
                date: formatDate(h.transaction.timestamp),
                amount:
                  h.transaction.toChain === '97' || h.transaction.fromChain === '97'
                    ? h.transaction.amount.toBigNumber(0).formatNumber(6, 3)
                    : h.transaction.amount
                        .toBigNumber(0)
                        .formatNumber(
                          token.cDecimals[h.transaction.toChain][h.symbol],
                          3
                        ),
                fullAmount: h.transaction.amount
                  .toBigNumber(0)
                  .formatString(token.decimals[h.transaction.toChain], 19),
                to: h.transaction.toChain as ChainId,
                from: h.transaction.fromChain as ChainId,
                fulfilled: h.fulfilled,
                claimInfo: h.claimInfo,
              },
              transaction: {
                ...h.transaction,
              },
            }))
        : []
    },
    loadingHistory: computed(() => bridge.loadingHistory),
    loading: computed(() => bridge.loading),
    limitPerSend: (chainId: ChainId) => bridge.limitPerSend[chainId],
    feeFulfill: (chainId: ChainId) => bridge.feeFulfill[chainId]?.formatNumber(2),
    feeSend: (chainId: ChainId) => bridge.feeSend[chainId]?.formatNumber(2),
    supportedChains: computed(() => factory.supportedChains),
    claimAmount: ref(0),
  }
}

const createAction = async (
  dialog: Dialog,
  action: () => Promise<ContractTransaction | null>,
  customDialog?: () => Promise<void | boolean>
) => {
  const dialogs = useDialogs()
  const web3 = useWeb3()
  // const token = useToken()
  const token = useToken()
  const uiBridge = useUIBridge()
  const bridge = useBridge()

  const [waiter, res] = createWaiter()

  const dialogSuccessText = (title?: string) => {
    switch (title) {
      case 'Approve':
        return `Transaction successfully completed.
        You can follow the information of your operation with the transaction hash:`
      case 'Transfer':
        return `Transaction successfully completed.
        You can follow the information of your operation with the transaction hash:`
      case 'Claim':
        return `Transaction successfully completed.
        You can follow the information of your operation with the transaction hash:`
      default:
        return `Transaction successfully completed.
        You can follow the information of your operation with the transaction hash:`
    }
  }

  const dialogErrorText = (title?: string) => {
    switch (title) {
      // case 'Enable transaction':
      //   return 'Smth u need'
      // case 'Claim':
      //   return 'Not claimed'
      // case 'Transfer':
      //   return 'Not transfered'
      default:
        return 'Warning! An error has occurred. Please try again.'
    }
  }

  if (web3.realChainId !== uiBridge.network) {
    dialogs.openDialog(
      'waitDialog',
      {
        loading: true,
        success: false,
        errorMsg: dialogErrorText(dialog.title),
        waitingMsg: 'Waiting for switch',
        waitingText: 'Please switch your network to continue.',
        successMsg: '',
      },
      { notClosable: true }
    )

    const switched = await web3.switchChain(uiBridge.network)
    if (!switched) {
      dialogs.openDialog(
        'waitDialog',
        {
          loading: false,
          success: false,
          errorMsg: dialogErrorText(dialog.title),
          waitingMsg: 'Waiting for switch',
          waitingText: 'Please switch your network to continue.',
          successMsg: '',
        },
        { noCross: false }
      )
      return
    }
  }

  if (customDialog) {
    const result = await customDialog()
    res(result!)
  } else {
    dialogs.openDialog('confirmDialog', {
      ...dialog,
      onConfirm: () => res(true),
      onCancel: () => res(false),
    })
  }

  const response = await waiter
  if (!response) return

  dialogs.openDialog(
    'waitDialog',
    {
      loading: true,
      success: false,
      errorMsg: dialogErrorText(dialog.title),
      waitingMsg: 'Waiting for transaction',
      waitingText: 'It will take some time for the transaction to be completed.',
      successMsg: '',
    },
    { notClosable: true }
  )
  const success = await action()
  if (!success) {
    dialogs.openDialog(
      'waitDialog',
      {
        loading: false,
        success: false,
        errorMsg: dialogErrorText(dialog.title),
        waitingMsg: 'Waiting for transaction',
        waitingText: 'It will take some time for the transaction to be completed.',
        successMsg: '',
      },
      { noCross: false }
    )
    return
  }
  dialogs.openDialog('successAlert', {
    label: dialogSuccessText(dialog.title),
    btnText: dialog.title === 'Transfer' ? 'OK' : 'Done',
    txHash: success.hash,
    chainId: uiBridge.network,
  })

  if (dialog.title === 'Transfer') {
    uiBridge.inputAmount = ''
  }

  await bridge.upload()
  await token.upload()
  return
}

export const useBridgeWrite = () => {
  const bridge = useBridge()
  const token = useToken()
  const web3 = useWeb3()
  const uiBridge = useUIBridge()
  const dialogs = useDialogs()

  return {
    sortByDate: (asc = true, onlyUnclaimed = false) => {
      return bridge.histories
        .map((h) => {
          const decimals = token.decimals[h.transaction.fromChain]
          return {
            transactionCard: {
              date: formatDate(h.transaction.timestamp),
              amount: h.transaction.amount.toBigNumber(0).formatNumber(decimals, 3),
              fullAmount: h.transaction.amount
                .toBigNumber(0)
                .formatString(token.cDecimals[h.transaction.toChain][h.symbol], 19),
              to: h.transaction.toChain as ChainId,
              from: h.transaction.fromChain as ChainId,
              fulfilled: h.fulfilled,
              claimInfo: h.claimInfo,
            },
            transaction: {
              ...h.transaction,
            },
            fulfillTransaction: { ...h.fulfillTransaction },
          }
        })
        .sort((a, b) =>
          asc
            ? b.transaction.timestamp - a.transaction.timestamp
            : a.transaction.timestamp - b.transaction.timestamp
        )
        .filter((p) => (onlyUnclaimed ? !p.transactionCard.fulfilled : true))
    },
    enable: (amount: string, chainId: ChainId, tokenAddress?: string) =>
      createAction(enableDialog, () => {
        return token.approveIf(web3.signer!, amount, chainId, tokenAddress ?? '')
      }),
    bridge: (tokenAddress?: string) =>
      createAction(
        transferDialog,
        () =>
          bridge.send(
            uiBridge.inputAmount.toBigNumber(
              token.cDecimals[web3.chainId][token.cSymbol[tokenAddress ?? '']]
            ),
            uiBridge.to,
            tokenAddress ?? ''
          ),
        async () =>
          new Promise<boolean>((resolve) => {
            dialogs.openDialog(
              'transferDialog',
              {
                from: uiBridge.from,
                to: uiBridge.to,
                amount: uiBridge.inputAmount,
                onConfirm: () => resolve(true),
                onCancel: () => resolve(false),
              },
              {
                noCross: false,
                notClosable: false,
              }
            )
          })
      ),

    fulfill: (transaction: FulfillTx, amount: number, index: number) =>
      createAction(
        formatDialog(claimDialog(`${amount} ${token.symbol}`), {
          amount: `${amount} ${token.symbol}`,
        }),
        () => bridge.fulfill(transaction, index)
      ),
  }
}
