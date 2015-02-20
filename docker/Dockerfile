FROM million12/typo3-flow-neos-abstract:latest
MAINTAINER Dmitri Pisarev

ENV T3APP_BUILD_REPO_URL https://github.com/sfi-ru/SfiDistr.git
ENV T3APP_BUILD_BRANCH master
# Pre-install TYPO3 Neos into /tmp directory
RUN . /build-typo3-app/pre-install-typo3-app.sh
