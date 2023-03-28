# Contributing to Conventional Tools

We love your input! We want to make contributing to this project as easy and
transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Our development process

We use github to host code, to track issues and feature requests, as well as
accept pull requests.

There are two [milestones](https://github.com/Practically/conventional-tools/milestones)
for this project. We have the backlog, this is tasks that have been reported
and are out of scope for the current release. Then we have the current major
release milestones, this is tasks that the core team will be looking to work on
and get released in the current major version.

Anyone can work on any task they wish, the milestones are a way for us to
convey or current direction for this project.

Please ensure there is an issue first before starting work to make sure this is
something we are willing to merge. When deciding what to do, please find an
issue that interests you, a good place to start is with the  label "good first
issue".

Once your pull request has been merged the label "pending release" defines that
the task has been complete and will be included in the next release. When we do
the next release, all these issues will be closed.

## Any contributions you make will be under the BSD 3-Clause license

In short, when you submit code changes, your submissions are understood to be
under the same [BSD 3-Clause
License](https://github.com/Practically/conventional-tools/blob/0.x/LICENSE) that covers
the project. Feel free to contact the maintainers if that's a concern.

## Reporting bugs or requesting features

When submitting issues, please have a quick search to make sure your issue has
not already been reported. Please use the issue templates provided and add as
much detail as possible, this really helps when fixing bugs or getting the
feature implemented if the correct way.

## Pull requests

We have a different branch for each major version, the default branch will be
the current major version. A pull request should be made against the default
branch to make it into the next major version. If you are submitting a security
fix that needs to be backported, then you will need to create a pull requests
against each version branch your security patch needs to backported to.

When creating your pull request please fill out the template provided to help
out the maintainers as much as possible.

## Coding style

For this project we are using [ESLint](https://eslint.org/) and
[Prettier](https://prettier.io/) validating our coding style. Please run the
following command to lint your code.

```bash
yarn lint
```

## Committing convention

For this project we are using a variation of [Conventional Commits
v1.0.0-beta.3](https://www.conventionalcommits.org/en/v1.0.0-beta.3/). Where
possible please as as much detail in to the commit as you can.

```
<type>[optional scope]: <description>

[optional body]

[optional footer]
```

**Types**

- **build**: Changes that affect the build system or external dependencies
- **ci**: Changes to our CI configuration files and scripts
- **docs**: Documentation only changes
- **feat**: A new feature
- **fix**: A bug fix
- **improvement**: A improvement to an existing feature
- **perf**: A code change that improves performance
- **refactor**: A code change that neither fixes a bug nor adds a feature
- **revert**: For when your reverting commits with
  [git](https://git-scm.com/docs/git-revert)
- **style**: Changes that do not affect the meaning of the code (white-space,
  formatting, etc)
- **test**: Adding missing tests or correcting existing tests

**Scopes**

- **core** Changes affecting the core code of Conventional Tools
- **changelog** Changes affecting the changelog command
- **commitgen** Changes affecting the commitgen command
- **commitlint** Changes affecting the commitlint command
- **release** Changes affecting the release command
- **release-semver** Changes affecting the release-semver command
- **release-calver** Changes affecting the release-calver command
- **git-hooks** Changes affecting the git-hooks command

This project does not use scopes.

**Trailers**

- **Ref:** References a commit or issue
- **See:** Add URLs to the commit with more information
- **Fixes-issue:** References an issue number
- **Regression-in:** Commit sha of the commit that introduced a bug
- **Co-authored-by:** Email address or Username of your co author
- **SECURITY:** Highlights a security issue, so we can take more care when testing this
- **BREAKING CHANGE:** Defines a breaking change the will cause a major version bump

## License

By contributing, you agree that your contributions will be licensed under its
BSD 3-Clause License.
