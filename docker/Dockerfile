FROM million12/typo3-flow-neos-abstract:latest:latest
MAINTAINER Dmitri Pisarev

ADD container-files /

ENV T3APP_BUILD_REPO_URL="https://github.com/sfi-ru/SfiDistr.git" \
  T3APP_BUILD_BRANCH="master" \
  T3APP_USE_SURF_DEPLOYMENT=true
# Pre-install TYPO3 Neos into /tmp directory
RUN . /build-typo3-app/pre-install-typo3-app.sh
