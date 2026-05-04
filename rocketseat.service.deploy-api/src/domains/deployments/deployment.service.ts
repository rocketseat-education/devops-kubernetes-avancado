import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeployRequestDto } from './deployment.dto';
import { HelmService } from '../helm/helm.service';

@Injectable()
export class DeploymentsService {
  constructor(
    private readonly helm: HelmService,
    private readonly config: ConfigService,
  ) {}

  async deploy(dto: DeployRequestDto) {
    const releaseName = this.buildReleaseName(dto.app, dto.environment);
    const namespace = this.buildNamespace(dto.environment);

    const values = {
      app: dto.app,
      environment: dto.environment,
      image: dto.image,
      replicaCount: dto.replicaCount ?? 1,
      containerPort: dto.containerPort ?? 3000,
      env: dto.env ?? {},
      resources: dto.resources ?? {},
      ...(dto.extraValues ?? {}),
    };

    const helmResult = await this.helm.upgradeInstall({
      releaseName,
      chartName: dto.chart,
      namespace,
      values,
      dryRun: dto.dryRun,
    });

    return {
      releaseName,
      namespace,
      chart: dto.chart,
      image: dto.image,
      dryRun: dto.dryRun ?? false,
      helm: helmResult,
    };
  }

  private buildReleaseName(app: string, environment: string): string {
    return `${app}-${environment}`.toLowerCase();
  }

  private buildNamespace(environment: string): string {
    const prefix = this.config.get<string>('NAMESPACE_PREFIX', '');
    const fallback = this.config.get<string>('DEFAULT_K8S_NAMESPACE', 'default');

    if (!prefix) {
      return fallback;
    }

    return `${prefix}-${environment}`.toLowerCase();
  }
}
