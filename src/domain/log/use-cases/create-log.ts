import { CreateLogDto } from "@/domain/log/dtos/create-log.dto";
import { LogEntity } from "@/domain/entities/log.entity";
import { LogRepository } from "@/domain/log/repositories/log.repository";

interface ICreateLogUseCase {
  execute(dto: CreateLogDto): Promise<LogEntity>;
}

export class CreateLog implements ICreateLogUseCase {
  constructor(private readonly repository: LogRepository) {}

  async execute(dto: CreateLogDto): Promise<LogEntity> {
    return this.repository.createLog(dto);
  }
}
