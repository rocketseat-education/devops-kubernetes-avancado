import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

export type HelmUpgradeInput = {
  releaseName: string;
  chartName: string;
  namespace: string;
  values: Record<string, unknown>;
  dryRun?: boolean;
};

@Injectable()
export class HelmService {
  constructor(private readonly config: ConfigService) {}

  async upgradeInstall(
    input: HelmUpgradeInput,
  ): Promise<{ command: string; stdout: string; stderr: string }> {
    const chartsRoot = this.config.get<string>('HELM_CHARTS_ROOT', './charts');
    const timeout = this.config.get<string>('HELM_TIMEOUT', '5m');
    const chartPath = resolve(chartsRoot, input.chartName);
    const tempDir = await mkdtemp(join(tmpdir(), 'deploy-values-'));
    const valuesPath = join(tempDir, `${input.releaseName}.values.json`);

    try {
      await writeFile(valuesPath, JSON.stringify(input.values, null, 2));

      const args = [
        'upgrade',
        '--install',
        input.releaseName,
        chartPath,
        '--namespace',
        input.namespace,
        '--create-namespace',
        '--values',
        valuesPath,
        '--atomic',
        '--wait',
        '--timeout',
        timeout,
      ];

      if (input.dryRun) {
        args.push('--dry-run');
      }

      const result = await this.run('helm', args);

      return {
        command: `helm ${args.join(' ')}`,
        stdout: result.stdout,
        stderr: result.stderr,
      };
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  }

  private run(
    command: string,
    args: string[],
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolvePromise, reject) => {
      const child = spawn(command, args, { shell: false });
      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (chunk: Buffer) => {
        stdout += chunk.toString();
      });

      child.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });

      child.on('error', (error) => {
        reject(
          new InternalServerErrorException(
            `Failed to execute ${command}: ${error.message}`,
          ),
        );
      });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(
            new InternalServerErrorException({
              message: `Helm command failed with exit code ${code}`,
              command: `${command} ${args.join(' ')}`,
              stdout,
              stderr,
            }),
          );
          return;
        }

        resolvePromise({ stdout, stderr });
      });
    });
  }
}
