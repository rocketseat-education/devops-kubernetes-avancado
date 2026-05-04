import { Module } from '@nestjs/common';
import { DeploymentsModule } from './domains/deployments/deployment.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true }), DeploymentsModule],
})
export class AppModule {}
