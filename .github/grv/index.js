'use strict'
const core = require('@actions/core')
const fs = require('fs')
const YAML = require('yaml')
const github = require('@actions/github');
const { context } = require('@actions/github')
const GITHUB_TOKEN = "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";
const octokit = github.getOctokit(GITHUB_TOKEN);


const { pull_request } = context.payload;
const privateFilePath = '../../configuration/private'
const publicFilePath = '../../configuration/public'
const utf8Encoding = 'utf-8'
let errorCount = 0


const runAction = async () => {
  try {

    console.log('javascript works')

    core.info('verify-domain-name-uniqueness-action: starting')


    if (errorCount > 0) throw new Error(`${errorCount} Opens-search yaml configuration errors: Duplicate domain names`)

  } catch (error) {
    core.setFailed(error)
  }
}





runAction()




