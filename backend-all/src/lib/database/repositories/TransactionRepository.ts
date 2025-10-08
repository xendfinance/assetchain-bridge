import { DeepPartial, FindOptionsWhere, In, Repository } from 'typeorm'
import { Transaction } from '../entities/Transaction'
import { AppDataSource } from '../data-source'

export class TransactionRepository {
  private repository: Repository<Transaction>

  constructor() {
    this.repository = AppDataSource.getRepository(Transaction)
  }

  async findOne(where: FindOptionsWhere<Transaction>) {
    return this.repository.findOne({
      where,
    })
  }

  async find(where: FindOptionsWhere<Transaction>) {
    return this.repository.find({
      where,
    })
  }

  async findAll() {
    return this.repository.find()
  }

  async findById(id: string) {
    return this.repository.findOne({
      where: { id },
    })
  }

  async findByUserAddress(userAddress: string) {
    return this.repository.find({
      where: { userAddress },
    })
  }

  async findByUserAddressAndChainId(userAddress: string, chainId: string) {
    return this.repository.find({
      where: { userAddress, chainId },
    })
  }

  async findByFromUser(fromUser: string) {
    return this.repository.find({
      where: { fromUser },
    })
  }

  async findByToUser(toUser: string) {
    return this.repository.find({
      where: { toUser },
    })
  }

  async findByNonce(nonce: number) {
    return this.repository.find({
      where: { nonce },
    })
  }

  async findByFromUserAndNonce(fromUser: string, nonce: number) {
    return this.repository.findOne({
      where: { fromUser, nonce },
    })
  }

  async findByFulfillFromUserAndFulfillNonce(
    fulfillFromUser: string,
    fulfillNonce: number
  ) {
    return this.repository.findOne({
      where: { fulfillFromUser, fulfillNonce },
    })
  }

  async findBySymbol(symbol: string) {
    return this.repository.find({
      where: { symbol },
    })
  }

  async findByFulfilled(fulfilled: boolean) {
    return this.repository.find({
      where: { fulfilled },
    })
  }

  async findByFromChain(fromChain: string) {
    return this.repository.find({
      where: { fromChain },
    })
  }

  async findByToChain(toChain: string) {
    return this.repository.find({
      where: { toChain },
    })
  }

  async findByChainId(chainId: string) {
    return this.repository.find({
      where: { chainId },
    })
  }

  async findByIndex(index: number) {
    return this.repository.find({
      where: { index },
    })
  }

  async findByTransactionHash(transactionHash: string) {
    return this.repository.findOne({
      where: { transactionHash },
    })
  }

  create(transactionData: Partial<Transaction>) {
    const transaction = this.repository.create(transactionData)
    return transaction
  }

  async save(transaction: DeepPartial<Transaction>) {
    return await this.repository.save(transaction)
  }

  async insert(transaction: Transaction[]) {
    return await this.repository.insert(transaction)
  }

  async update(id: string, transactionData: Partial<Transaction>) {
    await this.repository.update(id, transactionData)
    return this.findById(id)
  }

  async updateByFromUserAndNonce(
    fromUser: string,
    nonce: number,
    transactionData: Partial<Transaction>
  ) {
    await this.repository.update({ fromUser, nonce }, transactionData)
    return this.findByFromUserAndNonce(fromUser, nonce)
  }

  async updateByFulfillFromUserAndFulfillNonce(
    fulfillFromUser: string,
    fulfillNonce: number,
    transactionData: Partial<Transaction>
  ) {
    await this.repository.update({ fulfillFromUser, fulfillNonce }, transactionData)
    return this.findByFulfillFromUserAndFulfillNonce(fulfillFromUser, fulfillNonce)
  }

  async updateByTransactionHash(
    transactionHash: string,
    transactionData: Partial<Transaction>
  ) {
    await this.repository.update({ transactionHash }, transactionData)
    return this.findByTransactionHash(transactionHash)
  }

  async delete(id: string) {
    const result = await this.repository.delete(id)
    return (
      result.affected !== undefined && result.affected !== null && result.affected > 0
    )
  }

  async deleteByFromUserAndNonce(fromUser: string, nonce: number) {
    const result = await this.repository.delete({ fromUser, nonce })
    return (
      result.affected !== undefined && result.affected !== null && result.affected > 0
    )
  }

  async deleteByFulfillFromUserAndFulfillNonce(
    fulfillFromUser: string,
    fulfillNonce: number
  ) {
    const result = await this.repository.delete({ fulfillFromUser, fulfillNonce })
    return (
      result.affected !== undefined && result.affected !== null && result.affected > 0
    )
  }

  async deleteByTransactionHash(transactionHash: string) {
    const result = await this.repository.delete({ transactionHash })
    return (
      result.affected !== undefined && result.affected !== null && result.affected > 0
    )
  }

  async findTransactionsByUserAndChain(userAddress: string, chainId: string) {
    return this.repository.find({
      where: { userAddress, chainId },
    })
  }

  async findTransactionsBySymbolAndChain(symbol: string, chainId: string) {
    return this.repository.find({
      where: { symbol, chainId },
    })
  }

  async findUnfulfilledTransactions() {
    return this.repository.find({
      where: { fulfilled: false },
    })
  }

  async findFulfilledTransactions() {
    return this.repository.find({
      where: { fulfilled: true },
    })
  }

  async findTransactionsByTimeRange(startTime: string, endTime: string) {
    return this.repository
      .createQueryBuilder('transaction')
      .where('transaction.timestamp >= :startTime', { startTime })
      .andWhere('transaction.timestamp <= :endTime', { endTime })
      .getMany()
  }

  async findTransactionsByAmountRange(minAmount: string, maxAmount: string) {
    return this.repository
      .createQueryBuilder('transaction')
      .where('CAST(transaction.amount AS NUMERIC) >= CAST(:minAmount AS NUMERIC)', {
        minAmount,
      })
      .andWhere('CAST(transaction.amount AS NUMERIC) <= CAST(:maxAmount AS NUMERIC)', {
        maxAmount,
      })
      .getMany()
  }

  async countByUserAddress(userAddress: string) {
    return this.repository.count({ where: { userAddress } })
  }

  async countByChainId(chainId: string) {
    return this.repository.count({ where: { chainId } })
  }

  async countBySymbol(symbol: string) {
    return this.repository.count({ where: { symbol } })
  }

  async countByFulfilled(fulfilled: boolean) {
    return this.repository.count({ where: { fulfilled } })
  }

  async existsByFromUserAndNonce(fromUser: string, nonce: number) {
    const count = await this.repository.count({ where: { fromUser, nonce } })
    return count > 0
  }

  async existsByFulfillFromUserAndFulfillNonce(
    fulfillFromUser: string,
    fulfillNonce: number
  ) {
    const count = await this.repository.count({
      where: { fulfillFromUser, fulfillNonce },
    })
    return count > 0
  }

  async existsByTransactionHash(transactionHash: string) {
    const count = await this.repository.count({ where: { transactionHash } })
    return count > 0
  }

  async findTransactionsWithPagination(offset: number, limit: number) {
    return this.repository.find({
      skip: offset,
      take: limit,
      order: { createdAt: 'DESC' },
    })
  }

  async findTransactionsByUserWithPagination(
    userAddress: string,
    options: { page: number; limit: number },
    chainIds?: string[],
    fulfilled?: boolean,
    symbol?: string,
    secondaryAddress?: string
  ) {
    let { page, limit } = options
    page = +page
    limit = +limit
    const skip = (page - 1) * limit

    let addresses = [userAddress]

    if (secondaryAddress){
      addresses.push(secondaryAddress)
    }

    let whereCondition: any = { userAddress: In(addresses) }
    if (chainIds && chainIds.length > 0) {
      whereCondition.chainId = In(chainIds)
    }
    if (fulfilled !== undefined) {
      whereCondition.fulfilled = fulfilled
    }
    if (symbol) {
      if (symbol === 'XRWA'){
        symbol = 'RWA'
      }
      whereCondition.symbol = symbol
    }
    // console.log('whereCondition', whereCondition)

    // Get total count for pagination metadata
    const totalCount = await this.repository.count({
      where: whereCondition,
    })

    // Get paginated items
    const items = await this.repository.find({
      where: {
        ...whereCondition,
      },
      skip: skip,
      take: limit,
      order: { transactionHash: 'DESC' },
    })

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPreviousPage = page > 1

    return {
      items,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage,
        hasPreviousPage,
        nextPage: hasNextPage ? page + 1 : null,
        previousPage: hasPreviousPage ? page - 1 : null,
      },
    }
  }
}
