import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { MAX_QUESTION_LENGTH } from '../../chat.constants';

export class AskQuestionDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_QUESTION_LENGTH)
  question!: string;
}
