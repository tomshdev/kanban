import { Octokit } from 'octokit';

let octokitInstance = null;

export function createOctokit(token) {
  octokitInstance = new Octokit({ auth: token });
  return octokitInstance;
}

export function getOctokit() {
  return octokitInstance;
}

export function clearOctokit() {
  octokitInstance = null;
}
