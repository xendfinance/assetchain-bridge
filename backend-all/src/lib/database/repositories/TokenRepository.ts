import { FindOptionsWhere, Repository } from "typeorm";
import { Token } from "../entities/Token";
import { AppDataSource } from "../data-source";

export class TokenRepository {
  private repository: Repository<Token>;

  constructor() {
    this.repository = AppDataSource.getRepository(Token);
  }

  async findOne(where: FindOptionsWhere<Token>) {
    return this.repository.findOne({
      where,
      relations: ["bridgeInfos"]
    });
  }

  async find(where: FindOptionsWhere<Token>) {
    return this.repository.find({
      where,
      relations: ["bridgeInfos"]
    });
  }

  async findAll() {
    return this.repository.find({
      relations: ["bridgeInfos"]
    });
  }

  async findById(id: string) {
    return this.repository.findOne({ 
      where: { id },
      relations: ["bridgeInfos"]
    });
  }

  async findByTokenAddress(tokenAddress: string) {
    return this.repository.findOne({ 
      where: { tokenAddress },
      relations: ["bridgeInfos"]
    });
  }



  async findByChainId(chainId: string) {
    return this.repository.find({ 
      where: { chainId },
      relations: ["bridgeInfos"]
    });
  }

  async findBySymbol(symbol: string) {
    return this.repository.find({ 
      where: { symbol },
      relations: ["bridgeInfos"]
    });
  }

  async findByName(name: string) {
    return this.repository.findOne({ 
      where: { name },
      relations: ["bridgeInfos"]
    });
  }

  async create(tokenData: Partial<Token>) {
    const token = this.repository.create(tokenData);
    return token;
  }

  async save(token: Token) {
    return await this.repository.save(token);
  }

  async update(id: string, tokenData: Partial<Token>) {
    await this.repository.update(id, tokenData);
    return this.findById(id);
  }

  async updateByTokenAddress(tokenAddress: string, tokenData: Partial<Token>) {
    await this.repository.update({ tokenAddress }, tokenData);
    return this.findByTokenAddress(tokenAddress);
  }

  async delete(id: string) {
    const result = await this.repository.delete(id);
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async deleteByTokenAddress(tokenAddress: string) {
    const result = await this.repository.delete({ tokenAddress });
    return result.affected !== undefined && result.affected !== null && result.affected > 0;
  }

  async findTokensByChainAndSymbol(chainId: string, symbol: string) {
    return this.repository.find({
      where: { chainId, symbol },
      relations: ["bridgeInfos"]
    });
  }

  async existsByTokenAddress(tokenAddress: string) {
    const count = await this.repository.count({ where: { tokenAddress } });
    return count > 0;
  }
}
