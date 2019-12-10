# Openapi Platform Pipelines

This repo is used by:

- [Azure/azure-rest-api-specs](https://github.com/Azure/azure-rest-api-specs)

## Overview

When we setup pipelines and tools for openapi repos, we get a problem for non-master branch:
our tooling/pipeline fix is not picked up with other branch, for example, in spec repo our fix
on master branch is not synced to service team's branch which cause a lot of problem. Our solution
is to make a new repository and reference pipeline and tools from this repo.

### Pipeline yaml reference

[YAML template reuse doc](https://docs.microsoft.com/en-us/azure/devops/pipelines/process/templates?view=azure-devops#using-other-repositories)

Basically we reference yaml file to this repo. Every reference entry point (act as anchor for reference)
should be `.azure-pipelines/main-<repo>-<name>.yaml`.

### Tools reference

For more details please see comments in `scripts/pipeline-env-enable.ts`.

When the main repo installs (e.g. npm install), it should clone this repo in tmp folder and launch `tmp/scripts/pipeline-env-enable.js`.
This could be done by putting the following section in main repo's `package.json`:

``` json
"scripts": {
  "postinstall": "rimraf tmp && git clone https://github.com/Azure/azure-rest-api-specs-pipeline tmp && npm run enable-env",
  "enable-env": "node tmp/scripts/pipeline-env-enable.js --repo=azure-rest-api-specs"
}
```

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.opensource.microsoft.com.

When you submit a pull request, a CLA bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., status check, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
