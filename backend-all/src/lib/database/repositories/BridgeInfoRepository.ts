import { FindOptionsWhere, Repository } from "typeorm";
import { BridgeInfo } from "../entities/BridgeInfo";
import { AppDataSource } from "../data-source";

export class BridgeInfoRepository {
  private repository: Repository<BridgeInfo>;

  constructor() {
    this.repository = AppDataSource.getRepository(BridgeInfo);
  }

  async findOne(where: FindOptionsWhere<BridgeInfo>) {
    return this.repository.findOne({
      where,
      relations: ["token"]
    });
  }

  async find(where: FindOptionsWhere<BridgeInfo>) {
    return this.repository.find({
      where,
      relations: ["token"]
    });
  }

  async findAll() {
    return this.repository.find({
      relations: ["token"]
    });
  }

  async findById(id: string) {
    return this.repository.findOne({ 
      where: { id },
      relations: ["token"]
    });
  }

  async findByBridgeAddress(bridgeAddress: string) {
    return this.repository.findOne({ 
      where: { bridgeAddress },
      relations: ["token"]
    });
  }

  async findByChainId(chainId: string) {
    return this.repository.find({ 
      where: { chainId },
      relations: ["token"]
    });
  }

  async findByTokenId(tokenId: string) {
    return this.repository.find({ 
      where: { tokenId },
      relations: ["token"]
    });
  }

  async findByTokenAddress(tokenAddress: string) {
    return this.repository
      .createQueryBuilder("bridgeInfo")
      .leftJoinAndSelect("bridgeInfo.token", "token")
      .where("token.tokenAddress = :tokenAddress", { tokenAddress })
      .getMany();
  }

  create(bridgeInfoData: Partial<BridgeInfo>) {
    const bridgeInfo = this.repository.create(bridgeInfoData);
    return bridgeInfo;
  }

  async save(bridgeInfo: BridgeInfo) {
    return this.repository.save(bridgeInfo);
  }

  async update(id: string, bridgeInfoData: Partial<BridgeInfo>) {
    await this.repository.update(id, bridgeInfoData);
    return this.findById(id);
  }

  async updateByBridgeAddress(bridgeAddress: string, bridgeInfoData: Partial<BridgeInfo>) {
    await this.repository.update({ bridgeAddress }, bridgeInfoData);
    return this.findByBridgeAddress(bridgeAddress);
  }

  async delete(id: string) {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async deleteByBridgeAddress(bridgeAddress: string) {
    const result = await this.repository.delete({ bridgeAddress });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async findBridgeInfosByChainAndToken(chainId: string, tokenId: string) {
    return this.repository.find({
      where: { chainId, tokenId },
      relations: ["token"]
    });
  }

  async existsByBridgeAddress(bridgeAddress: string) {
    const count = await this.repository.count({ where: { bridgeAddress } });
    return count > 0;
  }

  async findBridgesWithTokenDetails() {
    return this.repository
      .createQueryBuilder("bridgeInfo")
      .leftJoinAndSelect("bridgeInfo.token", "token")
      .orderBy("bridgeInfo.createdAt", "DESC")
      .getMany();
  }

  async updateFees(bridgeAddress: string, fees: { feeFulfill: number; feeSend: number }) {
    await this.repository.update({ bridgeAddress }, { fees });
    return this.findByBridgeAddress(bridgeAddress);
  }

  async updateLimitPerSend(bridgeAddress: string, limitPerSend: string) {
    await this.repository.update({ bridgeAddress }, { limitPerSend });
    return this.findByBridgeAddress(bridgeAddress);
  }
}
