import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export enum Environment {
  Dev = 'dev',
  Staging = 'staging',
  Production = 'production',
}

export class ImageDto {
  @IsString()
  @IsNotEmpty()
  repository!: string;

  @IsString()
  @IsNotEmpty()
  tag!: string;
}

export class ResourcesDto {
  @IsOptional()
  @IsString()
  cpu?: string;

  @IsOptional()
  @IsString()
  memory?: string;
}

export class DeployRequestDto {
  @IsString()
  @IsNotEmpty()
  app!: string;

  @IsEnum(Environment)
  environment!: Environment;

  @IsString()
  @IsNotEmpty()
  chart!: string;

  @ValidateNested()
  @Type(() => ImageDto)
  image!: ImageDto;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  replicaCount?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  containerPort?: number;

  @IsOptional()
  @IsObject()
  env?: Record<string, string>;

  @IsOptional()
  @ValidateNested()
  @Type(() => ResourcesDto)
  resources?: ResourcesDto;

  @IsOptional()
  @IsObject()
  extraValues?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}
