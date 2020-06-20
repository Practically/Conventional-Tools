# Git Hooks

Git hooks can be configured pre project in in your config file. If you are not
familiar with git hooks your can read more about them
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

## Multi line commands

You can add multi line scripts in your hooks. You can add a comment as the first
line in your command and this will be the title of the hook you will see in the
output. The bellow example if from the prettier docs to format your staged
files.

```yaml
hooks:
  pre-commit:
    - |
      # Run prettier on staged files
      set -e
      FILES=$(git diff --cached --name-only --diff-filter=ACMR "*.ts" | sed 's| |\\ |g')
      [ -z "$FILES" ] && exit 0

      # Prettify all selected files
      echo "$FILES" | xargs ./node_modules/.bin/prettier --write

      # Add back the modified/prettified files to staging
      echo "$FILES" | xargs git add

      exit 0
```

The output from this hooks is.

```txt
 ➔ Running Hooks

  ✔ Run prettier on staged files

 ✔ All hooks have completed successfuly
```
