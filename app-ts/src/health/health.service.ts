import { Injectable } from '@nestjs/common';

@Injectable()
export class HealthService {
  checkHealth(): string {
    console.log('Chequei a saúde da aplicação!');
    return 'Estou saudável!';
  }

  checkReady(): string {
    console.log('Chequei a prontidão da aplicação!');
    return 'Estou pronto!';
  }
}
