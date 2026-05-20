import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumberString,
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

export class ChartDto {
  @IsString()
  @IsNotEmpty()
  url!: string;

  @IsString()
  @IsNotEmpty()
  revision!: string;

  @IsString()
  @IsNotEmpty()
  path!: string;
}

export class ServiceDto {
  @IsString()
  @IsNotEmpty()
  type!: string;

  @IsInt()
  @IsNotEmpty()
  port!: number;
}

export class ProbeDto {
  @IsBoolean()
  @IsNotEmpty()
  enabled!: boolean;

  @IsString()
  @IsOptional()
  path!: string;
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
  team!: string;

  @IsString()
  @IsNotEmpty()
  charts!: ChartDto;

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

  @IsString()
  @IsNotEmpty()
  service!: ServiceDto;

  @IsString()
  @IsNotEmpty()
  probes!: ProbesDto;

  @IsOptional()
  @IsObject()
  extraValues?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  dryRun?: boolean;
}
