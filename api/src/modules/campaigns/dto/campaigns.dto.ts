import {
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CampaignItemRuleDto {
  @ApiProperty({ example: 1, description: 'Sepetteki sıra (1 tabanlı)' })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(999)
  position!: number;

  @ApiProperty({ example: 10, description: 'Bu sıradaki ürün için indirim %' })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(90)
  discountPercent!: number;
}

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

  @ApiPropertyOptional({
    type: [CampaignItemRuleDto],
    description: 'Sepette N. ürün (adet) için indirim kuralları',
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignItemRuleDto)
  itemRules?: CampaignItemRuleDto[];

  @ApiPropertyOptional({
    enum: ['flat', 'nth_item', 'both'],
    default: 'flat',
  })
  @IsOptional()
  @IsIn(['flat', 'nth_item', 'both'])
  ruleMode?: 'flat' | 'nth_item' | 'both';

  @ApiPropertyOptional({ example: '11.11', description: 'Vitrin rozeti' })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  badge?: string;

  @ApiPropertyOptional({
    example: 'singles-day',
    description:
      'default | singles-day | halloween | black-friday | valentine | new-year | ramadan | kurban',
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

  @ApiPropertyOptional({ description: 'Flash banner görsel URL' })
  @IsOptional()
  @IsString()
  @MaxLength(512)
  imageUrl?: string;

  @ApiPropertyOptional({ description: 'en/de/fr/es kampanya metinleri' })
  @IsOptional()
  translations?: Record<string, { name?: string; headline?: string }>;

  @ApiPropertyOptional()
  @IsOptional()
  imagesByLocale?: Record<string, string>;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  useSharedImage?: boolean;

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
