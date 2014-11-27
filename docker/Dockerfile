FROM million12/typo3-flow-neos-abstract:latest
MAINTAINER Dmitri Pisarev dimaip@gmail.com

# ENV: Repository for installed TYPO3 Neos distribution 
ENV T3APP_BUILD_REPO_URL https://github.com/dimaip/SfiDistr.git

# ENV: Install following TYPO3 Neos version
ENV T3APP_BUILD_BRANCH master

ENV T3APP_BUILD_COMPOSER_PARAMS --dev --prefer-source

# Pre-install TYPO3 Neos into /tmp directory
RUN . /build-typo3-app/pre-install-typo3-app.sh
