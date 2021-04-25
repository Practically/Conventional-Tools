# Git Hooks

Git hooks can be configured pre project in in your config file. If you are not
familiar with git hooks your can read more about them
[here](https://git-scm.com/docs/githooks). To install all of the hook scripts
you will need to run the below command.

```sh
conventional-tools git-hook:install
```

!!! note If you are upgrading from `v0.3.2` There was a bugfix that requires you
to reinstall you hooks. You can do this by running the above command.

This will install all of the script files. To uninstall the hooks you can run
the install command

```sh
conventional-tools git-hook:uninstall
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

```plaintext
 ➔ Running Hooks

  ✔ Run prettier on staged files

 ✔ All hooks have completed successfuly
```

## Variable Substitution

If you look at the git hooks docs some hooks get passed params to use in your
scripts. For example the `prepare-commit-msg` hook get the commit message file
passed through as the first argument. These can be used in the hooks defined in
your `.ctrc.yml` by using `${n}` in your command where `n` is the number of the
parameter you would like to replace. The below example will run
`cat ".git/COMMIT_MSG"`

```yaml
hooks:
  prepare-commit-msg:
    - cat "${1}"
```

If the parameter at the index dose not exist then it will be replaced by an
empty string. This will allow to test if the parameter is empty with the bash
`-z` syntax.

```yaml
hooks:
  pre-commit:
    - |
      # Is the param empty
      [ -z "${2}" ] && exit 0

      # Or wrap code in an if
      if [ ! -z "${2}" ]; then
          # Do some pre commit stuff
      fi
```
