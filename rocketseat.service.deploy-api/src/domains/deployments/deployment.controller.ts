import { Body, Controller, Post } from '@nestjs/common';
import { DeployRequestDto } from './deployment.dto';
import { DeploymentsService } from './deployment.service';

@Controller('deployments')
export class DeploymentsController {
  constructor(private readonly deployments: DeploymentsService) {}

  @Post()
  deploy(@Body() dto: DeployRequestDto) {
    return this.deployments.deploy(dto);
  }
}
