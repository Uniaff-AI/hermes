import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { FileType } from '../../../../domain/file';
import { EntityDocumentHelper } from '../../../../../utils/document-entity-helper';

export type FileSchemaDocument = HydratedDocument<FileSchemaClass>;

@Schema({
  timestamps: true,
  toJSON: {
    virtuals: true,
  },
})
export class FileSchemaClass extends EntityDocumentHelper implements FileType {
  @Prop()
  path!: string;

  id!: string;
}

export const FileSchema = SchemaFactory.createForClass(FileSchemaClass);
