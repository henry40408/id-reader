import { Knex } from 'knex';
import { Tables } from 'knex/types/tables';

export type TableName = keyof Tables;

export abstract class BaseRepository<TName extends TableName, TCName extends TableName> {
  constructor(
    protected readonly knex: Knex,
    protected readonly tableName: TName,
    protected readonly compositeTableName: TCName,
  ) {}

  async findAll(): Promise<Tables[TName][]> {
    return this.knex(this.tableName).select('*');
  }

  async findById(id: number): Promise<Tables[TName] | undefined> {
    return this.knex(this.tableName).where({ id }).first() as Promise<Tables[TName] | undefined>;
  }

  async create(data: Tables[TCName]['insert']): Promise<Tables[TName]> {
    const [id] = await this.knex(this.tableName).insert(data);
    return this.findById(id) as Promise<Tables[TName]>;
  }

  async update(id: number, data: Tables[TCName]['update']): Promise<Tables[TName] | undefined> {
    await this.knex(this.tableName).where({ id }).update(data);
    return this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.knex(this.tableName).where({ id }).delete();
  }

  query(): Knex.QueryBuilder<Tables[TName]> {
    return this.knex(this.tableName);
  }
}
