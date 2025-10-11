import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  TokenOwnerOffCurveError,
} from '@solana/spl-token'
import {
  clusterApiUrl,
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from '@solana/web3.js'
import { AnchorProvider, BN, Program } from '@coral-xyz/anchor'
import NodeWallet from '@coral-xyz/anchor/dist/cjs/nodewallet'
import IDL from './idl/assetchain_bridge_solana.json'
import { AssetchainBridgeSolana } from './types/assetchain_bridge_solana'
import { ExtractedTransaction, ITransaction } from '@/types'
import { ChainId } from '@/gotbit-tools/node/types'
import bs58 from 'bs58'
import CONFIRMATION from '../../confirmations.json'
import { BigNumber } from 'ethers'
import { SOLANABRIDGE_TOKENS } from '../constant'
import { config } from 'dotenv'

config()

// console.log(process.env.SOLANA_KEY!, 'sksk')

const isMain = process.env.SOLANA_MAINNET === 'true'

const secretKey = bs58.decode(process.env.SOLANA_KEY!)

// export const CURRENT_CHAIN_BUFFER = () =>
//   Buffer.from(CURRENT_CHAIN().padEnd(32, "\0"), "ascii");

/**
 * Get the Solana workspace.
 *
 * @returns workspace The Solana workspace.
 * @returns workspace.payer The creator of the bridge instance.
 * @returns workspace.owner The creator of the bridge instance.
 * @returns workspace.tokenMint The Solana token address.
 * @returns workspace.connection The Solana connection.
 * @returns workspace.provider The Solana provider.
 * @returns workspace.program The Solana program.
 */
export const solanaWorkspace = (bridgeAssist: string, tokenMint: string) => {

  const owner = Keypair.fromSecretKey(secretKey)

  const network = clusterApiUrl(isMain ? 'mainnet-beta' : 'devnet')
  const connection = new Connection(network, 'confirmed')
  const provider = new AnchorProvider(connection as any, new NodeWallet(owner as any), {
    preflightCommitment: 'confirmed',
  })
  const program = new Program<AssetchainBridgeSolana>(IDL, provider)

  if (!tokenMint) throw new Error(`Token mint not initialized`)
  return {
    payer: owner,
    owner,
    tokenMint: new PublicKey(tokenMint),
    connection,
    provider,
    program,
  }
}

/**
 * Async version of getAssociatedTokenAddressSync
 * For backwards compatibility
 *
 * @param mint                     Token mint account
 * @param owner                    Owner of the new account
 * @param allowOwnerOffCurve       Allow the owner account to be a PDA (Program Derived Address)
 * @param programId                SPL Token program account
 * @param associatedTokenProgramId SPL Associated Token program account
 *
 * @return Promise containing the address of the associated token account
 */
export async function getAssociatedTokenAddress(
  mint: PublicKey,
  owner: PublicKey,
  allowOwnerOffCurve = false,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
): Promise<PublicKey> {
  if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer()))
    throw new TokenOwnerOffCurveError()

  const [address] = await PublicKey.findProgramAddress(
    [owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
    associatedTokenProgramId
  )
  return address
}

export async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  mint: PublicKey,
  owner: PublicKey,
  payer: Keypair // payer pays the account creation fee
): Promise<PublicKey> {
  // 1. Derive ATA address
  const ata = await getAssociatedTokenAddress(mint, owner);

  // 2. Check if ATA account exists
  const accountInfo = await connection.getAccountInfo(ata);
  if (accountInfo === null) {
    // ATA does not exist; create it
    const ix = createAssociatedTokenAccountInstruction(
      payer.publicKey, // payer
      ata,             // ATA address to create
      owner,           // owner of ATA
      mint             // mint
    );

    const tx = new Transaction().add(ix);

    // Send transaction to create ATA
    await sendAndConfirmTransaction(connection, tx, [payer], {commitment:'confirmed'});

    console.log(`Created ATA: ${ata.toBase58()}`);
  } else {
    console.log(`ATA exists: ${ata.toBase58()}`);
  }

  return ata;
}

/**
 * Converts a transaction to a common representation not dependent on anchor or ethers. Used to display transaction data
 * and build the fulfill transaction on the frontend.
 *
 * @param tx The transaction to convert
 * @returns extractedTx The converted transaction
 */
export const extractTransaction = (tx: ITransaction): ExtractedTransaction => {
  return {
    fromUser: tx.fromUser,
    toUser: tx.toUser,
    amount: tx.amount.toString(),
    timestamp: tx.timestamp.toString(),
    fromChain: tx.fromChain,
    toChain: tx.toChain,
    nonce: tx.nonce.toString(),
    block: tx.block.toString(),
    confirmationsRequired: getConfirmationsRequired(tx.fromChain) + '',
  }
}

export function getConfirmationsRequired(network: string) {
  if (network.startsWith('evm.')) {
    const chainId = network.slice(4) as ChainId
    return CONFIRMATION[chainId!]
  } else {
    return CONFIRMATION.solana
  }
}

/**
 * Get an instance-specific empty PDA used as a marker of the transaction with nonce `nonce` having been fulfilled on
 * Solana.
 *
 * @param programId Solana program ID.
 * @param bridgeOwner Creator of the bridge instance
 * @param tokenMint Solana token address
 * @param nonce Nonce of the transaction
 * @param fromChain Source chain, e.g. "evm.1" for Ethereum.
 * @returns account The instance-specific empty PDA used as a marker of the transaction with nonce `nonce` having been fulfilled on Solana
 */
const getEmptyAccount = (
  programId: PublicKey,
  bridgeOwner: PublicKey,
  tokenMint: PublicKey,
  nonce: BN,
  fromChain: string
) => {
  return PublicKey.findProgramAddressSync(
    [
      SOLANA_PROGRAM_VERSION().toBuffer('be', 8),
      Buffer.from('fulfilled'),
      bridgeOwner.toBuffer(),
      tokenMint.toBuffer(),
      nonce.toBuffer('be', 8),
      CHAIN_TO_BUFFER(fromChain),
      SOL_CHAIN_BUFFER(),
    ],
    programId
  )
}

export async function isToSolanaTxFulfilled(
  toBridgeAddress: string,
  _tokenMint: string,
  fromChainId: ChainId,
  nonce: BigNumber
): Promise<boolean> {
  const { owner, program,tokenMint } = solanaWorkspace(toBridgeAddress, _tokenMint)


  // const { bridgeAssist } = useContracts(undefined, fromChainId)
  // const CURRENT_CHAIN = await safeRead(bridgeAssist.CURRENT_CHAIN(), 'INVALID')
  // if (CURRENT_CHAIN == 'INVALID') return false
  const CURRENT_CHAIN = 'evm.' + fromChainId

  const emptyAccount = getEmptyAccount(
    program.programId,
    owner.publicKey,
    tokenMint,
    new BN(nonce.toString()),
    CURRENT_CHAIN
  )[0]

  const emptyAccountInfo = await program.provider.connection.getAccountInfo(emptyAccount)

  return emptyAccountInfo !== null
}

// const getBridgeAccount = (
//   name: string,
//   programId: PublicKey,
//   bridgeOwner: PublicKey,
//   tokenMint: PublicKey
// ) => {
//   return PublicKey.findProgramAddressSync(
//     [
//       SOLANA_PROGRAM_VERSION().toBuffer("be", 8),
//       Buffer.from(name),
//       bridgeOwner.toBuffer(),
//       tokenMint.toBuffer(),
//       CURRENT_CHAIN_BUFFER(),
//     ],
//     programId
//   );
// };

/**
 * Builds a Solana fulfill transaction and signs it with the key that created the bridge instance.
 *
 * @param tx The transaction to fulfill
 * @param userTokenAccount The user's token account that will receive the funds
 * @returns fulfillTx The fulfill transaction signed and serialized
 */
export const signSolana = async (
  toBridgeAddress: string,
  tx: ExtractedTransaction,
  _tokenMint: string,
  userTokenAccount: PublicKey
) => {
  const { owner, program, tokenMint, connection } = solanaWorkspace(toBridgeAddress, _tokenMint)

  const user = new PublicKey(tx.toUser)
  console.log(user.toBase58(), 'toUser')
  const bridgeTokenAccount = getBridgeAccount(
    'wallet',
    program.programId,
    owner.publicKey,
    tokenMint
  )[0]
  console.log(bridgeTokenAccount.toBase58(), 'bridgeTokenAccount')
  const bridgeParams = getBridgeAccount(
    'bridge_params',
    program.programId,
    owner.publicKey,
    tokenMint
  )[0]
  console.log(bridgeParams.toBase58(), 'bridgeParams')

  const params = await program.account.bridgeParams.fetch(bridgeParams)

  // const { bridgeAssist } = useContracts(undefined, tx.fromChain.slice(4) as EthChainId)
  // const CURRENT_CHAIN = await bridgeAssist.CURRENT_CHAIN()
  const CURRENT_CHAIN = tx.fromChain

  const instruction = await (program.methods as any)
    .fulfill(
      new BN(tx.nonce),
      new BN(tx.amount),
      SOLANA_PROGRAM_VERSION(),
      SOL_CHAIN_B32(),
      CHAIN_TO_B32(CURRENT_CHAIN)
    )
    .accounts({
      tokenMint,
      userTokenAccount,
      bridgeTokenAccount,
      feeAccount: params.feeRecipient,
      user,
      owner: owner.publicKey,
      bridgeParams,
      emptyAccount: getEmptyAccount(
        program.programId,
        owner.publicKey,
        tokenMint,
        new BN(tx.nonce),
        CURRENT_CHAIN
      )[0],
      fromChainData: getChainDataAccount(
        program.programId,
        owner.publicKey,
        tokenMint,
        CURRENT_CHAIN
      )[0],
    })
    .instruction()

  const solanaTx = new Transaction()
  solanaTx.add(instruction)
  solanaTx.feePayer = user
  solanaTx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash
  solanaTx.partialSign(owner)

  return solanaTx.serialize({ requireAllSignatures: false })
}

function parseBytes32String(bytes32Buffer: Buffer) {
  // Find first null byte
  const nullIndex = bytes32Buffer.indexOf(0)
  if (nullIndex !== -1) {
    return bytes32Buffer.slice(0, nullIndex).toString('utf8')
  }
  // If no null byte found, convert all
  return bytes32Buffer.toString('utf8')
}

export async function getSolanaSendTx(
  owner: Keypair,
  tokenMint: PublicKey,
  program: Program<AssetchainBridgeSolana>,
  user: PublicKey,
  nonce: string,
  fromChain: string
) {
  const sendTxKey = getSendTxAccount(
    program.programId,
    owner.publicKey,
    tokenMint,
    user,
    new BN(nonce)
  )[0]
  const sendTxAccount = await program.account.bridgeSendTx.fetch(sendTxKey)

  if (!sendTxAccount) throw new Error(`Transaction not found with nonce ${nonce}`)

  const tx: ITransaction = {
    fromUser: user.toString(),
    toUser: '0x' + Buffer.from(sendTxAccount.to.byte).toString('hex').slice(0, 40),
    amount: solanaBnToEthersBn(sendTxAccount.amount),
    timestamp: solanaBnToEthersBn(sendTxAccount.timestamp),
    fromChain: fromChain,
    toChain: parseBytes32String(Buffer.from(sendTxAccount.toChain.byte)),
    nonce: BigNumber.from(nonce),
    block: solanaBnToEthersBn(sendTxAccount.block),
  }

  return tx
}

function solanaBnToEthersBn(bn: BN) {
  return BigNumber.from(bn.toString())
}
/**
 * Gets a bridge instance-specific user-specific PDA. Used to get the `send_nonce` account that stores the user's nonce.
 *
 * @param name Name of the account, e.g. "send_nonce".
 * @param programId Solana program ID.
 * @param bridgeOwner Creator of the bridge instance
 * @param tokenMint Solana token address
 * @param user Solana address of the user
 * @returns account The user-specific account
 */
export const getBridgeUserAccount = (
  name: string,
  programId: PublicKey,
  bridgeOwner: PublicKey,
  tokenMint: PublicKey,
  user: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      SOLANA_PROGRAM_VERSION().toBuffer('be', 8),
      Buffer.from(name),
      bridgeOwner.toBuffer(),
      tokenMint.toBuffer(),
      user.toBuffer(),
      SOL_CHAIN_BUFFER(),
    ],
    programId
  )
}

/**
 * Gets a bridge instance-specific PDA.
 *
 * @param name Name of the account, e.g. "bridge_params".
 * @param programId Solana program ID.
 * @param bridgeOwner Creator of the bridge instance
 * @param tokenMint Solana token address
 * @returns account The instance-specific PDA
 */
export const getBridgeAccount = (
  name: string,
  programId: PublicKey,
  bridgeOwner: PublicKey,
  tokenMint: PublicKey
) => {
  return PublicKey.findProgramAddressSync(
    [
      SOLANA_PROGRAM_VERSION().toBuffer('be', 8),
      Buffer.from(name),
      bridgeOwner.toBuffer(),
      tokenMint.toBuffer(),
      SOL_CHAIN_BUFFER(),
    ],
    programId
  )
}

/**
 * Gets a bridge-instance specific PDA storing data for a destination chain.
 * If the account does not exist, the chain is not supported.
 *
 * @param programId Solana program ID.
 * @param bridgeOwner Creator of the bridge instance
 * @param tokenMint Solana token address
 * @param toChain Destination chain, e.g. "evm.1" for Ethereum.
 * @returns account The instance-specific PDA storing data for a destination chain
 */
export const getChainDataAccount = (
  programId: PublicKey,
  bridgeOwner: PublicKey,
  tokenMint: PublicKey,
  toChain: string
) => {
  return PublicKey.findProgramAddressSync(
    [
      SOLANA_PROGRAM_VERSION().toBuffer('be', 8),
      Buffer.from('chain_data'),
      bridgeOwner.toBuffer(),
      tokenMint.toBuffer(),
      SOL_CHAIN_BUFFER(),
      CHAIN_TO_BUFFER(toChain),
    ],
    programId
  )
}

export const SOLANA_PROGRAM_VERSION: () => BN = () => new BN(1)
export const SOL_CHAIN = () => (isMain ? `sol.mainnet` : `sol.devnet`)

/** @returns chain The identifier of the Solana chain used as a null-terminated string encoded as a 32 byte long array of bytes (ASCII character codes). */
export const SOL_CHAIN_BUFFER = () => Buffer.from(SOL_CHAIN().padEnd(32, '\0'), 'ascii')
export const CHAIN_TO_BUFFER = (chain: string) =>
  Buffer.from(chain.padEnd(32, '\0'), 'ascii')

/**
 * @returns chain An object wrapping the result of SOL_CHAIN_BUFFER().
 * @returns chain.byte Solana chain used as a null-terminated string encoded as a 32 byte long array of bytes (ASCII character codes).
 */
export const SOL_CHAIN_B32 = () => ({
  byte: Array.from(SOL_CHAIN_BUFFER()),
})

/**
 * Converts a string (chain id) for passing it to the blockchain.
 *
 * @param chain The string to convert, e.g. "evm.1" for Ethereum.
 * @returns chain An object wrapping the result of CHAIN_TO_BUFFER().
 * @returns chain.byte A null-terminated padded converted string encoded as a 32 byte long array of bytes (ASCII character codes).
 */
export const CHAIN_TO_B32 = (chain: string) => ({
  byte: Array.from(CHAIN_TO_BUFFER(chain)),
})

/**
 * Get an instance-specific PDA storing data for a bridge transaction sent from Solana.
 *
 * @param programId Solana program ID.
 * @param bridgeOwner Creator of the bridge instance
 * @param tokenMint Solana token address
 * @param user Solana address of the user
 * @param nonce Nonce of the transaction
 * @returns account The instance-specific PDA storing data for a bridge transaction sent from Solana
 */
export const getSendTxAccount = (
  programId: PublicKey,
  bridgeOwner: PublicKey,
  tokenMint: PublicKey,
  user: PublicKey,
  nonce: BN
) => {
  return PublicKey.findProgramAddressSync(
    [
      SOLANA_PROGRAM_VERSION().toBuffer('be', 8),
      Buffer.from('send_tx'),
      bridgeOwner.toBuffer(),
      tokenMint.toBuffer(),
      user.toBuffer(),
      nonce.toBuffer('be', 8),
      SOL_CHAIN_BUFFER(),
    ],
    programId
  )
}

export async function hasPassedConfirmationSolana(
  connection: Connection,
  tx: ITransaction
) {
  const block = await connection.getSlot()
  return BigNumber.from(block).gt(tx.block.add(getConfirmationsRequired(tx.fromChain)))
}
