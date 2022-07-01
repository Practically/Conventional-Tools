# Release Semver

The release semver command is a way of managing project release cycles with
semantic visioning. The idea is to put this command in your CI pipeline and it
will handle your visioning. It will get the next version from your commits since
the last release and work out if it should be a major minor or patch.

The release process is:

1. Create and populate your `CHANGELOG.md`
2. Update package files
3. Create a release commit
4. Create a release tag
5. Push to the remote
6. Create a Gitlab release

## Configuration

You will need to configure the secrets and git provided before creating your
release. You can find more about that on the
[Release Config Page](./release-config.md)

Below is a example job you can put into your `.gitlab-ci.yaml`. It will create a
new release with every push to the master branch

```yaml
release:
  stage: release
  image: registry.k1.zportal.co.uk/practically-oss/conventional-tools:0.x
  variables:
    GIT_EMAIL: gitbot@practically.co.uk
    GIT_USER: Gitbot
    GIT_STRATEGY: clone
  script:
    - git config --global user.email "$GIT_EMAIL"
    - git config --global user.name "$GIT_USER"
    - git checkout $CI_COMMIT_BRANCH
    - conventional-tools release-semver
  only:
    - master
```

You can configure your tag prefix in your `.ctrc.yml`. The default prefix is `v`
and will create the tag like `v1.0.0`. The below config will now create a tag
like `release/1.0.0`

```yaml
git:
  tagPrefix: release/
```

## Force Bump

You can force a bump by passing the target release into your release command.
The three valid options are `major`, `minor` and `patch`.

```sh
conventional-tools release-semver patch
```

If your current tag is `v1.2.3` you will get the below outcomes:

- **major**: v2.0.0
- **minor**: v1.3.0
- **patch**: v1.2.4

## Pre Release

You can managing pre releases with semver. This can be done like forcing a bump.
You can pass `alpha`, `beta` or `rc` into the command to create a pre release.
Again if your current version is `v1.2.3`

```sh
#
# This will generate v1.2.3-alpha.0
#
conventional-tools release-semver alpha

#
# If we run that command again we will get v1.2.3-alpha.1
#
conventional-tools release-semver alpha
```

- **alpha**: v1.2.4-alpha.0
- **beta**: v1.2.4-beta.0
- **rc**: v1.2.4-rc.0

## Package Files

When releasing with semver the release command will automatically update common
config files. The supported config files are listed below.

- package.json
- composer.json
