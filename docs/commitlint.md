# Commitlint

The commitlint command will lint your commits to the
[conventional commit standard](https://www.conventionalcommits.org/en/v1.0.0-beta.2/).

```sh
conventional-tools commitlint
```

There are two levels of linting `errors` and `warnings`. Errors will return a
error response but warnings will not. This is so you can still commit if your
commits have warnings. Below is an example out put from the above command.

```sh
conventional-tools commitlint

fix(no): make it actually work

⚠ references may not be empty
✖ scope must be one of [core, api, web, ios, release]
```

You can disable warnings my using the `level` flag. This will not show you
warnings in your output

```sh
conventional-tools commitlint -l1

fix(no): make it actually work

✖ scope must be one of [core, api, web, ios, release]
```

## Types

Commit types are hard coded and cannot be changed. The following commit types
must be used. The ensures changelogs and semantic visioning can be used
correctly.

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

## Scopes

Scopes can be add pre project defined in your config file. The `release` scope
is automatically added when linting to ensures the release commits make by
conventional tools release commands

```yaml
commit:
  scopes:
    - core
    - api
    - web
    - ios
```

## Examples

```
fix(core): this is some fix

Some more into about the fix that can go into more detail

ref #123
```

```
style: phpcs
```

```
feat(web): add something cool

This add that cool thing that all of our user wanted
```
