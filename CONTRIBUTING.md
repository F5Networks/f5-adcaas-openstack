# Contributing

If you find this, it means you want to help us out. Thanks in advance for lending a hand! This guide should get you up and running quickly and make it easy for you to contribute.

## Getting the code and development environment setup

See [Introduction to WAFaaS Development, Test and Production](deploy/README.md).

## Pull requests

If you plan to submit a pull request, you need to make sure that you have done the following things.

* If an issue doesn't exist, file one.

* Make sure you have run lint checking and unit test, before submitting your pull request. Our CI system will do that after your submission. A pull request failing the CI test will not be reviewed by anyone.

* A reasonable set of unit tests is required for your code change. The code reviewer of your pull request is expecting to review them along with your code change.

* Make sure your code change does not compromise the test coverage. The code reviewer will look at the test coverage report of your pull request in [Coveralls](https://coveralls.io/github/F5Networks/f5-adcaas-openstack). He/she may refuse to approve your code change if the test coverage desreases a lot.

* Functional tests are nice-to-have, but they are not mandantory for completing a pull request.

* Clean up your git history. We do not expect anyone to submit a pull request containing dozens of commits for the same issue.
