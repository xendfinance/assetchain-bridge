export type Dialog = {
  title: string
  buttonText: string
  text: string
  waitingMsg: string
  waitingText: string
  errorMsg: string
  successMsg: string
}

export const approveDialog: Dialog = {
  title: 'Approve',
  buttonText: 'Yes, approve',
  text: 'You need to approve allowing interaction with the service to transfer your tokens',
  waitingMsg: 'Waiting msg',
  waitingText: 'It will take some time for the transaction to be completed.',
  errorMsg: 'Error msg',
  successMsg: 'Success msg',
}

export const transferDialog: Dialog = {
  title: 'Transfer',
  buttonText: 'Transfer',
  text: 'you are withdrawing only the tokens you earned while staking. Your stake stays active and continues to accumulate rewards.',
  waitingMsg: 'Waiting',
  waitingText: 'It will take some time for the transaction to be completed.',
  errorMsg: 'Warning! An error has occurred. Please try again.',
  // successMsg:
  //   'Transaction will appear in your history where you will be able to claim your tokens. You can follow the status of your operation with the transaction hash:',
  successMsg: 'Transaction hash:',
}
// export const unstakeDialog: Dialog = {
//   title: 'Unstake',
//   buttonText: 'Unstake',
//   text: 'you are withdrawing the amount of tokens you both staked and earned. Your current stake stops accumulating rewards in this case.',
//   waitingMsg: 'Waiting msg',
//   errorMsg: 'Error msg',
//   successMsg: 'Success msg',
// }
export const unstakeDialog: Dialog = {
  title: 'Unstake',
  buttonText: 'Unstake',
  text: 'you are withdrawing the amount of tokens you both staked and earned. Your current stake stops accumulating rewards in this case.',
  waitingMsg: 'Waiting for your tokens',
  waitingText: 'It will take some time for the transaction to be completed.',
  errorMsg: "We couldn't proceed your unstake. Please try again!",
  successMsg: 'Congratulations! Your unstake transaction is completed.',
}

// export const enableDialog: Dialog = {
//   title: 'Enable transaction',
//   buttonText: 'Confirm',
//   text: 'you allow the staking contract to transfer tokens from your wallet address',
//   waitingMsg: 'Waiting for confirmation',
//   waitingText: 'It will take some time for the confirmation to be completed.',
//   errorMsg: "We couldn't proceed your confirm. Please try again!",
//   successMsg: 'Congratulations! Confirmation is completed.',
// }

export const enableDialog: Dialog = {
  title: 'Approve',
  buttonText: 'Yes, approve',
  text: 'You need to approve allowing interaction with the service to transfer your tokens',
  waitingMsg: 'Waiting for confirmation',
  waitingText: 'It will take some time for the confirmation to be completed.',
  errorMsg: "We couldn't proceed your confirm. Please try again!",
  successMsg: 'Congratulations! Confirmation is completed.',
}

export const claimDialog = (amount: string): Dialog => ({
  title: 'Claim',
  buttonText: 'Confirm',
  text: `Claim your ${amount} tokens to get unfreezed and transferred to the receiving wallet. `,
  waitingMsg: 'Waiting msg',
  errorMsg: 'Error msg',
  successMsg: 'Success msg',
  waitingText: '',
})

export const switchDialog: Dialog = {
  title: 'Switch',
  buttonText: 'Okay',
  text: '',
  waitingMsg: 'Waiting ',
  waitingText: 'It will take some time for t...',
  errorMsg: "We couldn't proceed ... Please try again!",
  successMsg: 'Congratulations! Confirmation is completed.',
}

export const changeNetworkDialog: Dialog = {
  title: '',
  buttonText: '',
  text: '',
  waitingMsg: '',
  waitingText: '',
  errorMsg: 'Please change your network to procceed transactions on the page',
  successMsg: '',
}
