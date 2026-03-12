import { IsArray, IsNumber, IsOptional, IsString, ValidateNested, Min, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderItemDto } from './create-order.dto';

export class UpdateOrderDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items?: OrderItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  total?: number;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  note?: string;
}
