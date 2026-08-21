import {
  IsEmail,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  ALLOWED_MIME_TYPE,
  MAX_FILE_SIZE_BYTES,
} from '../../documents.constants';

export class CreateUploadUrlDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fileName!: string;

  @IsString()
  @IsIn([ALLOWED_MIME_TYPE])
  fileType!: string;

  @IsInt()
  @Min(1)
  @Max(MAX_FILE_SIZE_BYTES)
  fileSize!: number;
}
