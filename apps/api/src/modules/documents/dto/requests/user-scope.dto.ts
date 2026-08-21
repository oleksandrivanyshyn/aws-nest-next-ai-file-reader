import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserScopeDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;
}
