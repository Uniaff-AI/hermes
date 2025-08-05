import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { FileType } from '../../../../domain/file';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

@Entity({
  name: 'file',
})
export class FileEntity extends EntityRelationalHelper implements FileType {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  path!: string;
}
