# Changelog

The changelog command populate a `CHANGELOG.md` file with the changes from the
git history biased on the [conventional commit
standard](https://www.conventionalcommits.org/en/v1.0.0-beta.2/). For more
infomation on commits in conventional tools you can see the
[commitlint](/docs/commitlint.md) page.

To generate a changelog you can run the command with the new version. The tag
prefix is added for you from the `.ctrc.yaml` file you can read more about this
on the [release semver command](/docs/release-semver.md#configuration)

```bash
conventional-tools changelog 0.0.1
```

To create a scoped changelog you can use the `-s` flag this will create a change
log with scoped tag format. In the below example this would be `live@2020.05.05`

```bash
conventional-tools changelog 2020.05.05 -s live
```

Changelogs are filtered to the current working directory. So to generate a
changelog on a subset of the repository you can `cd` into that directory and run
the command from there. This is useful when working with mono repository's and
you have many sub packages.
