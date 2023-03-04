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

    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: pull_request.number,
      body: 'Thank you for submitting a pull request! We will try to review this as soon as we can.'
    });

    core.info('verify-domain-name-uniqueness-action: starting')

    findDomainDuplicates(await getDomains())

    if (errorCount > 0) throw new Error(`${errorCount} Opens-search yaml configuration errors: Duplicate domain names`)

  } catch (error) {
    core.setFailed(error)
  }
}


const getDomains = async () => {
  let domainNames = []
  const privateFiles = await fs.promises.readdir(privateFilePath)
  const publicFiles = await fs.promises.readdir(publicFilePath)

  // Get files in private folder
  for await (const privateFile of privateFiles) {
    const privateFIleStream = await fs.promises.readFile(`${privateFilePath}/${privateFile}`, utf8Encoding)
    for (const enviroments of YAML.parse(privateFIleStream).environments) {
      domainNames.push({ fileName: `${privateFilePath}/${privateFile}`, domainName: `${YAML.parse(privateFIleStream).name}_${enviroments?.name}`, publicFacing: enviroments?.public_facing })
    }
  }

  // Get files in public folder
  for await (const publicFile of publicFiles) {
    const publicFileStream = await fs.promises.readFile(`${publicFilePath}/${publicFile}`, utf8Encoding)
    for (const enviroments of YAML.parse(publicFileStream).environments) {
      domainNames.push({ fileName: `${publicFilePath}/${publicFile}`, domainName: `${YAML.parse(publicFileStream).name}_${enviroments?.name}`, publicFacing: enviroments?.public_facing })
    }
  }

  return domainNames
}



// FInd duplicate domain names and display the path on the console 

const findDomainDuplicates = async (domains) => {
  let domainArray = domains.map((item) => {
    if (item.publicFacing) {
      core.warning(`The domain "${item.domainName}" in file "${item.fileName}" is public facing`)
    }
    return item.domainName
  });
  const findDuplicates = arr => arr.filter((item, index) => arr.indexOf(item) !== index)
  const duplicates = findDuplicates(domainArray);
  const duplicateDomainFIles = domains.filter(domain => duplicates.some(domainName => domain.domainName === domainName))

  for await (const dup of duplicates) {
    errorCount++
  }

  if (errorCount) {
    core.error(`Domain name duplicate error: There are ${errorCount + 1} duplicate domain names`)
    console.table(duplicateDomainFIles, duplicateDomainFIles.domainName)
  } else {
    core.info('\u001b[38;5;6mverify-domain-name-uniqueness-action: complete - Domain uniqueness check passed ✔')
  }

}



runAction()