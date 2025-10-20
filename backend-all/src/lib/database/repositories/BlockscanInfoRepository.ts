import { FindOptionsWhere, Repository } from "typeorm";
import { BlockscanInfo } from "../entities/BlockscanInfo";
import { AppDataSource } from "../data-source";

export class BlockscanInfoRepository {
  private repository: Repository<BlockscanInfo>;

  constructor() {
    this.repository = AppDataSource.getRepository(BlockscanInfo);
  }

  async findOne(where: FindOptionsWhere<BlockscanInfo>) {
    return this.repository.findOne({
      where
    });
  }

  async find(where: FindOptionsWhere<BlockscanInfo>) {
    return this.repository.find({
      where
    });
  }

  async findAll() {
    return this.repository.find();
  }

  async findById(id: string) {
    return this.repository.findOne({ 
      where: { id }
    });
  }

  async findByChainId(chainId: string) {
    return this.repository.find({ 
      where: { chainId }
    });
  }

  async findByContractAddress(contractAddress: string) {
    return this.repository.find({ 
      where: { contractAddress }
    });
  }

  async findByChainIdAndContractAddress(chainId: string, contractAddress: string) {
    return this.repository.findOne({ 
      where: { chainId, contractAddress }
    });
  }

  async create(blockscanInfoData: Partial<BlockscanInfo>) {
    const blockscanInfo = this.repository.create(blockscanInfoData);
    return blockscanInfo;
  }

  async save(blockscanInfo: BlockscanInfo) {
    return await this.repository.save(blockscanInfo);
  }

  async update(id: string, blockscanInfoData: Partial<BlockscanInfo>) {
    await this.repository.update(id, blockscanInfoData);
    return this.findById(id);
  }

  async updateByChainIdAndContractAddress(chainId: string, contractAddress: string, blockscanInfoData: Partial<BlockscanInfo>) {
    await this.repository.update({ chainId, contractAddress }, blockscanInfoData);
    return this.findByChainIdAndContractAddress(chainId, contractAddress);
  }

  async updateLastBlockScanned(chainId: string, contractAddress: string, lastBlockScanned: string) {
    await this.repository.update({ chainId, contractAddress }, { lastBlockScanned });
    return this.findByChainIdAndContractAddress(chainId, contractAddress);
  }

  async delete(id: string) {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async deleteByChainIdAndContractAddress(chainId: string, contractAddress: string) {
    const result = await this.repository.delete({ chainId, contractAddress });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async deleteByChainId(chainId: string) {
    const result = await this.repository.delete({ chainId });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async deleteByContractAddress(contractAddress: string) {
    const result = await this.repository.delete({ contractAddress });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async findBlockscanInfosByChain(chainId: string) {
    return this.repository.find({
      where: { chainId }
    });
  }

  async findBlockscanInfosByContract(contractAddress: string) {
    return this.repository.find({
      where: { contractAddress }
    });
  }

  async countByChainId(chainId: string) {
    return this.repository.count({ where: { chainId } });
  }

  async countByContractAddress(contractAddress: string) {
    return this.repository.count({ where: { contractAddress } });
  }

  async countAll() {
    return this.repository.count();
  }

  async existsByChainIdAndContractAddress(chainId: string, contractAddress: string) {
    const count = await this.repository.count({ where: { chainId, contractAddress } });
    return count > 0;
  }

  async existsByChainId(chainId: string) {
    const count = await this.repository.count({ where: { chainId } });
    return count > 0;
  }

  async existsByContractAddress(contractAddress: string) {
    const count = await this.repository.count({ where: { contractAddress } });
    return count > 0;
  }

  async findBlockscanInfosWithPagination(offset: number, limit: number) {
    return this.repository.find({
      skip: offset,
      take: limit,
      order: { updatedAt: 'DESC' }
    });
  }

  async findBlockscanInfosByChainWithPagination(chainId: string, offset: number, limit: number) {
    return this.repository.find({
      where: { chainId },
      skip: offset,
      take: limit,
      order: { updatedAt: 'DESC' }
    });
  }

  async upsertByChainIdAndContractAddress(chainId: string, contractAddress: string, blockscanInfoData: Partial<BlockscanInfo>) {
    const existing = await this.findByChainIdAndContractAddress(chainId, contractAddress);
    
    if (existing) {
      return this.updateByChainIdAndContractAddress(chainId, contractAddress, blockscanInfoData);
    } else {
      const newData = { ...blockscanInfoData, chainId, contractAddress };
      const newBlockscanInfo = this.repository.create(newData);
      return this.save(newBlockscanInfo);
    }
  }

  async getLatestBlockForChainAndContract(chainId: string, contractAddress: string) {
    const blockscanInfo = await this.findByChainIdAndContractAddress(chainId, contractAddress);
    return blockscanInfo?.lastBlockScanned || "0";
  }

  async getAllChains() {
    return this.repository
      .createQueryBuilder("blockscanInfo")
      .select("DISTINCT blockscanInfo.chainId", "chainId")
      .getRawMany();
  }

  async getAllContractAddresses() {
    return this.repository
      .createQueryBuilder("blockscanInfo")
      .select("DISTINCT blockscanInfo.contractAddress", "contractAddress")
      .getRawMany();
  }

  async getAllChainAndContractCombinations() {
    return this.repository
      .createQueryBuilder("blockscanInfo")
      .select("blockscanInfo.chainId", "chainId")
      .addSelect("blockscanInfo.contractAddress", "contractAddress")
      .addSelect("blockscanInfo.lastBlockScanned", "lastBlockScanned")
      .getRawMany();
  }
}
