# Configuration

Conventional tools can be configured with a yaml file in the root of your
project. The yaml file must be called `.ctrc.yml`. All config options can be
found in the
[schema file](https://git.baln.co.uk/general/conventional-tools/blob/master/src/config.schema.json)

## Example

```yaml
hooks:
  commit-msg:
    - ./bin/run commitlint -f HEAD~2
  pre-push:
    - ./bin/run commitlint -l1
commit:
  scopes:
    - core
    - commitlint
    - release
    - release-semver
    - release-calver
    - git-hooks
```

## Vim COC

You can configure vim coc to git your auto completion an intellisense when your
are editing your configuration. This is done my adding the schema url into your
coc settings that you can get to by running `:CocConfig`

```json
"yaml.schemas": {
    "https://git.baln.co.uk/general/conventional-tools/raw/master/src/config.schema.json": "/.ctrc.yml"
}
```
