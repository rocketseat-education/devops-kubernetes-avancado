import { Injectable, NotFoundException } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
import { response } from 'express';
import path from 'node:path';
import { env } from 'node:process';
import * as yaml from 'yaml';
import { DeployRequestDto } from '../domains/deployments/deployment.dto';

type GitHubFile = {
    sha?: string;
    content?: string;
};

@Injectable()
export class GitService {
    private readonly octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
    });

    private readonly owner = process.env.GITHUB_OWNER!;
    private readonly repo = process.env.GITHUB_REPO!;
    private readonly baseBranch = process.env.GITHUB_BASE_BRANCH ?? 'main';

    async commitDeployment(values: DeployRequestDto) {
        const filePath = this.getAppFilePath(values.environment, values.app);
        const currentFile = await this.getFileContentOrEmpty({
            path: filePath,
            branch: this.baseBranch,
        });
        const nextYaml = yaml.stringify(values);

        const response = await this.octokit.repos.createOrUpdateFileContents({
            owner: this.owner,
            repo: this.repo,
            path: filePath,
            branch: this.baseBranch,
            sha: currentFile.sha,
            message: `deploy(${values.environment}): ${values.app} ${values.image.tag}`,
            content: Buffer.from(nextYaml).toString('base64'),
        });

        return {
            mode: 'direct_commit',
            app: values.app,
            environment: values.environment,
            filePath,
            commitSha: response.data.commit.sha,
            commitUrl: response.data.commit.html_url,
        };
    }

    private async getFileContentOrEmpty(input: {
        path: string;
        branch: string;
    }): Promise<GitHubFile> {
        try {
            const response = await this.octokit.repos.getContent({
                owner: this.owner,
                repo: this.repo,
                path: input.path,
                ref: input.branch,
            });

            if (Array.isArray(response.data) || response.data.type !== 'file') {
                throw new NotFoundException(`GitOps file is not a file ${input.path}`);
            }

            return {
                sha: response.data.sha,
                content: Buffer.from(response.data.content, 'base64').toString('utf-8'),
            };
        } catch (error: any) {
            if (error.status === 404) {
                return {};
            }

            throw error;
        }
    }

    private getAppFilePath(environment: string, app: string) {
        return `apps/${environment}/${app}.yaml`;
    }
}