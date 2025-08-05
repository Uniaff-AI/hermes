import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule } from '../domain/rule.entity';

@Injectable()
export class RulesRepository {
  constructor(
    @InjectRepository(Rule)
    private readonly repo: Repository<Rule>,
  ) {}

  create(data: Partial<Rule>) {
    return this.repo.create(data);
  }
  save(rule: Rule) {
    return this.repo.save(rule);
  }
  findAll() {
    return this.repo.find();
  }
  findOne(id: string) {
    return this.repo.findOneBy({ id });
  }
  delete(id: string) {
    return this.repo.delete(id);
  }
}
