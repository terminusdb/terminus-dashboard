#!/bin/sh

#setup_git() {
 # git config --global user.email "travis@travis-ci.org"
 # git config --global user.name "Travis CI"
#}

commit_website_files() {
  git add . dist/*
  git commit --message "Travis build: $TRAVIS_BUILD_NUMBER"
}

upload_files() {
  git push origin HEAD --quiet
}

# setup_git
commit_website_files
upload_files