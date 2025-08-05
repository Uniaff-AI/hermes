import { ApiProperty } from '@nestjs/swagger';
import { FileType } from '../domain/file';

export class FileDto {
  @ApiProperty({
    type: String,
  })
  id!: string;

  @ApiProperty({
    type: String,
  })
  path!: string;

  constructor(file: FileType) {
    this.id = file.id;
    this.path = file.path;
  }
}
