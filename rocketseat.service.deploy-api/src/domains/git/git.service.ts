import { Injectable, NotFoundException } from '@nestjs/common';
import { Octokit } from '@octokit/rest';
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

  async openDeploymentPullRequest(values: DeployRequestDto) {
    const filePath = this.getAppFilePath(values.environment, values.app);
    const branchName = this.buildDeploymentBranchName(values);

    await this.createBranchFromBase({
      branchName,
      baseBranch: this.baseBranch,
    });

    const currentFile = await this.getFileContentOrEmpty({
      path: filePath,
      branch: branchName,
    });
    const nextYaml = yaml.stringify(values);

    await this.octokit.repos.createOrUpdateFileContents({
      owner: this.owner,
      repo: this.repo,
      path: filePath,
      branch: branchName,
      sha: currentFile.sha,
      message: `deploy(${values.environment}): ${values.app} ${values.image.tag}`,
      content: Buffer.from(nextYaml).toString('base64'),
    });

    const pullRequest = await this.octokit.pulls.create({
      owner: this.owner,
      repo: this.repo,
      title: `Deploy ${values.app} to ${values.environment}`,
      head: branchName,
      base: this.baseBranch,
      body: this.buildPullRequestBody(values, filePath),
    });

    return {
      mode: 'pull_request',
      app: values.app,
      environment: values.environment,
      filePath,
      branchName,
      pullRequestUrl: pullRequest.data.html_url,
      pullRequestNumber: pullRequest.data.number,
    };
  }

  private buildDeploymentBranchName(values: DeployRequestDto) {
    const safeTag = values.image.tag.replace(/[^a-zA-Z0-9._-]/g, '-');
    return `deploy/${values.environment}/${values.app}/${safeTag}`;
  }

  private buildPullRequestBody(values: DeployRequestDto, filePath: string) {
    return [
      `Atualiza o deploy de \`${values.app}\` em \`${values.environment}\``,
      '',
      `Arquivo alterado: \`${filePath}\``,
      `Imagem: \`${values.image.repository}:${values.image.tag}\``,
    ]
      .filter(Boolean)
      .join('\n');
  }

  private async createBranchFromBase(input: {
    branchName: string;
    baseBranch: string;
  }) {
    const baseBranchRef = await this.octokit.git.getRef({
      owner: this.owner,
      repo: this.repo,
      ref: `heads/${input.baseBranch}`,
    });

    try {
      await this.octokit.git.createRef({
        owner: this.owner,
        repo: this.repo,
        ref: `refs/heads/${input.branchName}`,
        sha: baseBranchRef.data.object.sha,
      });
    } catch (error: any) {
      if (error.status === 422) {
        return;
      }
      throw error;
    }
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
    return `apps/${environment}/${app}.values.yaml`;
  }
}
