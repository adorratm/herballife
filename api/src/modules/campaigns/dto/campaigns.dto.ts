import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateCampaignDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  @MaxLength(160)
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  slug?: string;

  @ApiProperty({ example: 15, description: 'İndirim yüzdesi 1–90' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(90)
  discountPercent!: number;

  @ApiPropertyOptional({ example: '11.11', description: 'Vitrin rozeti' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  badge?: string;

  @ApiPropertyOptional({
    example: 'singles-day',
    description:
      'default | singles-day | halloween | black-friday | valentine | new-year | ramadan',
  })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  theme?: string;

  @ApiPropertyOptional({ description: 'Kısa vitrin metni' })
  @IsOptional()
  @IsString()
  @MaxLength(280)
  headline?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'Boş = tüm ürünler',
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  productIds?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCampaignDto extends PartialType(CreateCampaignDto) {}
