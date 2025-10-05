import { CreateLogDto } from "../dtos/create-log.dto";
import { LogEntity } from "../entities/log.entity";
import { LogRepository } from "../repositories/log.repository";

interface ICreateLogUseCase {
  execute(dto: CreateLogDto): Promise<LogEntity>;
}

export class CreateLog implements ICreateLogUseCase {
  constructor(private readonly repository: LogRepository) {}

  async execute(dto: CreateLogDto): Promise<LogEntity> {
    return this.repository.createLog(dto);
  }
}