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
  hmg = 'hmg',
  prod = 'prod',
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

export class BaseResourceDto {
  @IsNotEmpty()
  @IsString()
  cpu: string;

  @IsNotEmpty()
  @IsString()
  memory: string;
}
export class ResourcesDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => BaseResourceDto)
  requests: BaseResourceDto;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => BaseResourceDto)
  limits: BaseResourceDto;
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

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => ResourcesDto)
  resources: ResourcesDto;

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
