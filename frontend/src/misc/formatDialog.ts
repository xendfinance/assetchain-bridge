import { Dialog } from '@/misc/dialogTexts'

export const createWaiter = (): [Promise<boolean>, (value: boolean) => void] => {
  let resolve: (value: boolean) => void = () => console.log('@click')
  const waiter = new Promise<boolean>((res) => (resolve = res))
  return [waiter, resolve]
}

const formatString = (targetString: string, keys: Record<string, string>): string => {
  let newString = targetString
  for (const [key, value] of Object.entries(keys)) {
    newString = newString.replace(new RegExp(`{${key}}`, 'g'), value)
  }
  return newString
}

export const formatDialog = (dialog: Dialog, keys: Record<string, string>) => {
  dialog = { ...dialog }
  for (const key in dialog) {
    dialog[key as keyof Dialog] = formatString(dialog[key as keyof Dialog], keys)
  }
  return dialog
}
