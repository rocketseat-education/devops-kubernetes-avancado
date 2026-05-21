import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeployRequestDto, Environment } from './deployment.dto';
import { GitService } from '../git/git.service';
@Injectable()

export class DeploymentsService {
  constructor(
    private readonly git: GitService,
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
      charts: dto.charts,
      team: dto.team,
      service: dto.service,
      probes: dto.probes,
      ...(dto.extraValues ?? {}),
    };
    if (values.environment === 'prod') {
      return this.git.openDeploymentPullRequest(values);
    }
    await this.git.commitDeployment(values);
    return {
      releaseName,
      namespace,
      charts: dto.charts,
      image: dto.image,
      dryRun: dto.dryRun ?? false,
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
