import { Octokit } from '@octokit/rest';
import { GITHUB_TOKEN } from './constants';

export interface TokenValidated {
  name: string;
  scopes: string[];
}

let octokit: Octokit;

export async function validateToken(token: string): Promise<TokenValidated> {
  const octokit = new Octokit({ auth: token });
  const response = await octokit.users.getAuthenticated();
  const name = response.data.name?.split(' ')[0] ?? response.data.login;
  return {
    name,
    scopes: response.headers['x-oauth-scopes']?.split(',').map((token) => token.trim()) ?? [],
  };
}

export function getOctokit(): Octokit {
  if (!octokit) {
    octokit = new Octokit({ auth: localStorage.getItem(GITHUB_TOKEN) });
    // TODO: Retrying plugin
  }
  return octokit;
}
