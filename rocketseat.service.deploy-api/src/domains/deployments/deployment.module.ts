import { Module } from '@nestjs/common';
import { HelmService } from '../helm/helm.service';
import { DeploymentsController } from './deployment.controller';
import { DeploymentsService } from './deployment.service';

@Module({
  controllers: [DeploymentsController],
  providers: [DeploymentsService, HelmService],
})
export class DeploymentsModule {}
