import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateOrderStatusDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(['pending', 'confirmed', 'preparing', 'delivering', 'completed', 'cancelled'])
  status: string;
}
