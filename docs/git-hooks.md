# Git Hooks

Git hooks can be configured pre project in in your config file. If you are not
familular with git hooks your can read more about them
[here](https://git-scm.com/docs/githooks). To install all of the hook scripts
you will need to run the below command.

```sh
conventional-tools git-hooks:install
```

This will install all of the script files. To uninstall the hooks you can run
the install command

```sh
conventional-tools git-hooks:uninstall
```

## Example

The below example will use conventional tools to lint your commit message before
your commit.

```yaml
hooks:
  commit-msg:
    - conventional-tools commitlint -f HEAD~2
```
