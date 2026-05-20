import { Module } from '@nestjs/common';
import { DeploymentsController } from './deployment.controller';
import { DeploymentsService } from './deployment.service';
import { GitService } from 'src/git/git.service';

@Module({
  controllers: [DeploymentsController],
  providers: [DeploymentsService, GitService],
})
export class DeploymentsModule {}
