FROM million12/typo3-flow-neos-abstract:latest
MAINTAINER Dmitri Pisarev

# ENV: Repository for installed TYPO3 Neos distribution 
ENV T3APP_BUILD_REPO_URL git://git.typo3.org/Neos/Distributions/Base.git

# ENV: Install following TYPO3 Neos version
ENV T3APP_BUILD_BRANCH master

# Pre-install TYPO3 Neos into /tmp directory
RUN . /build-typo3-app/pre-install-typo3-app.sh
