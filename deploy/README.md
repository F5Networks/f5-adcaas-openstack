# Introduction to WAFaaS Development, Test and Production

This document describes:

* How to setup the development/test environment for this project;
* How to release it as a standalone application, run it with docker-compose.

## Prerequisite for Development, Test and Production

This is a NodeJS project, implemented with TypeScript, applied LoopBack 4 framework to provide RESTful APIs.

To run or test it, you need to install the following dependencies in your sandbox.

* [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
* [Node.js](https://nodejs.org/en/)
* [LoopBack 4](https://loopback.io/doc/en/lb4/Getting-started.html)
* [Docker CE](https://docs.docker.com/install/)
* [Visual Studio Code](https://code.visualstudio.com/Download) (Optional, for Dev/Test. You can use any other IDEs, such as VIM)

## Development/Test

**Setup**:

Follow the the steps to setup your developing/testing sandbox.

1) Fork this code repository to your own repository.
2) Clone your repository to local sandbox.
3) Change directory to *\<localrepo>/app/waf*.
4) Run command `npm install` to install all package dependencies.

**Development**:

* Source codes are under *\<localrepo>/app/waf/src*.
* Use your preferred IDE(VIM or VSCode) for the development.
  
  VSCode is recommended because it's easy to debug the typescript after setting proper `launch.json` and `tasks.json` for the debug. See [Debugging in VSCode](https://code.visualstudio.com/Docs/editor/debugging).

* Manually testing requires a set of containers to be started: ASG, DO and POSTGRES.

  Refer to the docker-compose command from [Run WAFaaS as Standalone Application](#RunItStandalone) of this document.

**Test**:

The testing code(include acceptance and unit test) is under *\<localrepo>/app/waf/test*.

1) Run `npm run prettier:fix && npm run build` to compile it.

   `npm run prettier:fix` is to apply **tslint** to the code.

2) Run `npm test` to to trigger all test cases.

3) Run `npm run coverage` to check the code coverages.

   The code coverage should be fulfilled before check in. 

More details about development and test, see *\<localrepo>/app/waf/packages.json*.

## Production

WAFaaS is supported to be released as a docker image which users can pull from a docker repository.

The docker repository is owed by either users themselves or F5Networks.

### Release Docker Image Locally

1. Go to folder *\<localrepo>/app/waf*, where locates the `Dockerfile`.

2. Run docker build command mentioned in *\<localrepo>/app/waf/Dockerfile*.

   ```
   docker build . -t f5devcentral/f5-wafaas-openstack:latest
   ```

   Note that: Change *f5devcentral/f5-wafaas-openstack* to your own *[repo/tag:version]*.

### Publish WAFaaS Image To Docker Repository

Run `docker push [repo/tag:version]` to push your generated image to the public repository(after docker login).

### <span id = "RunItStandalone">Run WAFaaS as Standalone Application</span>

You can use *\<localrepo>/scripts/start_all.sh* to start all. The script is responsible for:

1) run the container initialization.
2) enable environment settings.
3) run `docker-compose up -d -f <localrepo>/deploy/docker-compose.yml` to start WAFAAS container and its dependent containers, see that *docker-compose.yml* file.

   Note: On MacOSX, running `start_all.sh` may get the error:
   ```
   ERROR: for ASG  Cannot start service ASG: Mounts denied:
      The path /var/tmp/ASGExtensions is not shared from OS X and is not known to Docker.
      You can configure shared paths from Docker -> Preferences... -> File Sharing.
      See https://docs.docker.com/docker-for-mac/osxfs/#namespaces for more info.
   ```
   **Solution**: Add `/var/tmp`(better) or `/var/tmp/ASGExtensions` to the settings as it mentions.

Note that for development and test, the WAFAAS container should be stopped and removed since we run WAFaaS application locally instead of the container. Use `docker rm --force WAFAAS` to remove it after `docker-compose up -d`.