# Commitgen

A commit generator in the conventional format customised by your `.ctrc.yml` and
your current branch. The branch naming convention is `type/issue-number`. For
example if you are working on a new feature with the ticket number of `222` your
branch would be `feat/222` and for a bug fix with the issue number `223` you
branch would be `fix/223`. You can also add a description suffix to the branch
name like
[GitLabs create a branch from issue naming](https://docs.gitlab.com/ee/user/project/repository/web_editor.html#create-a-new-branch-from-an-issue)
`feat/2-make-static-site-auto-deploy-and-serve`, and the type and issue number
will be picked up. This command will generate you a boilerplate commit message
that can be used in the `prepare-commit-msg` git hook to automatically populate
your commit message

## Usage

To run the command you can type this into your terminal. This will output a
boilerplate message you can copy and paste into the commit editor of your
choice. Once you have this in your commit message you can search for the word
`edit` and replace it with the relevant text. In the comment bellow the commit
message you will find all of the valid types along with the valid scopes that
have been defined in your projects `.ctrc.yml`. This should allow for your
editor to pick them up for auto completion.

```sh
conventional-tools commitgen
```

## Githook

If you have Conventional Tools git hooks installed you can add this to your
`.ctrc.yml` this will run the above command and add it to the top of the
`COMMIT_EDITMSG` file so its ready to edit when you commit.

```yaml
hooks:
  prepare-commit-msg:
    - |
      # Commitgen
      if [ -z "${2}" ]; then
        echo "$(conventional-tools commitgen)$(cat ${1})" > ${1}
      fi
```

## Example commits

```plaintext
feat(edit): edit

Ref: #222
# Generated commit message by conventional tools. If you do not want this
# message please delete above the comments and save the file. This will then
# abort due to an empty commit message.
#
# Valid types are:
#   build, chore, ci, docs, feat, fix, improvement, perf, refactor, revert,
#   style, test
#
# Valid scopes for this project are:
#   core, api, web, ios, android
#
# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch feat/222
# Changes to be committed:
#	modified:   README.md
```

```plaintext
fix(edit): edit

Fixes Issue: #223
# Generated commit message by conventional tools. If you do not want this
# message please delete above the comments and save the file. This will then
# abort due to an empty commit message.
#
# Valid types are:
#   build, chore, ci, docs, feat, fix, improvement, perf, refactor, revert,
#   style, test
#
# Valid scopes for this project are:
#   core, api, web, ios, android
#
# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch fix/223
# Changes to be committed:
#	modified:   README.md
```

If you are on a branch that dose not conform to this naming convention then you
will just get the comment with your commit types and scopes so you don't have to
look them up in your `.ctrc.yml`.

```plaintext


# Generated commit message by conventional tools. If you do not want this
# message please delete above the comments and save the file. This will then
# abort due to an empty commit message.
#
# Valid types are:
#   build, chore, ci, docs, feat, fix, improvement, perf, refactor, revert,
#   style, test
#
# Valid scopes for this project are:
#   core, api, web, ios, android
#
# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
#
# On branch not-to-the-naming-convention
# Changes to be committed:
#	modified:   README.md
```
