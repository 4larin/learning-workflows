'use strict'
const core = require('@actions/core')
const fs = require('fs')
const YAML = require('yaml')
const github = require('@actions/github');
const { context } = require('@actions/github')



const GITHUB_TOKEN = core.getInput('GITHUB_TOKEN');
const octokit = github.getOctokit(GITHUB_TOKEN);
 
const { pull_request } = context.payload;
 
async function run() {
  await octokit.rest.issues.createComment({
    ...context.repo,
    issue_number: pull_request.number,
    body: 'Thank you for submitting a pull request! We will try to review this as soon as we can.'
  });
}
 
run();