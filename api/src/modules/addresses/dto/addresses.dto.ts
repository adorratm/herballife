import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  title!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(160)
  fullName!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(40)
  phone!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  city!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(80)
  district!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  neighborhood?: string;

  @ApiProperty()
  @IsString()
  addressLine!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(20)
  postalCode!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefaultShipping?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isDefaultBilling?: boolean;

  @ApiPropertyOptional({ description: 'Kurumsal fatura ünvanı' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  companyTitle?: string;

  @ApiPropertyOptional({ description: 'Vergi kimlik no (VKN)' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  taxNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  taxOffice?: string;
}

export class UpdateAddressDto extends PartialType(CreateAddressDto) {}
