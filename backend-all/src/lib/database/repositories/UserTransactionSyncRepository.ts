import { FindOptionsWhere, Repository } from "typeorm";
import { UserTransactionSync } from "../entities/UserTransactionSync";
import { AppDataSource } from "../data-source";

export class UserTransactionSyncRepository {
  private repository: Repository<UserTransactionSync>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserTransactionSync);
  }

  async findOne(where: FindOptionsWhere<UserTransactionSync>) {
    return this.repository.findOne({
      where
    });
  }

  create(userTransactionSync: Partial<UserTransactionSync>) {
    return this.repository.create(userTransactionSync);
  }

  async save(userTransactionSync: UserTransactionSync) {
    return this.repository.save(userTransactionSync);
  }

  async insert(userTransactionSync: UserTransactionSync[]) {
    return this.repository.insert(userTransactionSync);
  }
}
