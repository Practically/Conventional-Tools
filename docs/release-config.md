# Release Config

!!! note

    Only Gnome desktops with [Passwords and Keys](https://help.gnome.org/users/seahorse/stable/)
    via `secret-tool` is currently supported as a secret backend and Gitlab as a release target.

Conventional Tools has some configuration options to configure releases based on
if you are releasing manually on your development machine or in a CI
environment. The CLI took can handle secret management and creating releases in
your git platform.

## Secrets

If you are on your local development machine you can use the `secret` command to
store secrets in your desktop secret manager. The key to your secret is the host
of your git server. The deployment secret is an API key for your git server and
can be created on [Gitlab](https://gitlab.com/-/profile/personal_access_tokens)
or [Github](https://github.com/settings/tokens)

Once your have you API key you can run the below command to store it.

```sh
conventional-tools secret gitlab.com
```

If you are "Password and Keys" as a secret store then you will need to install
[`secret-tool`](http://manpages.ubuntu.com/manpages/xenial/man1/secret-tool.1.html)
to interact with the password manager

```sh
sudo apt-get install secret-tool
```

If you are in a CI environment or conventional tools dose not support your
desktop you can set the `CT_TOKEN` environment variable. Note if you have a
secret stored for the host that will be used even if the environment variable is
set.

## Git Platform

You will also need to configure you git platform in the `.ctrc.yml` file under
the git key. You will need to setup the git provider and the project path on
your git host. Below is an example config of conventional tools.

```yaml
git:
  provider: gitlab
  project: practically-oss/conventional-tools
```

## Gitlab CE and Enterprise Github

If you are using a git provider this is not hosted at the default URL you will
need to configure the `git.host`. This will be the base host to your git
instance

```yaml
git:
  provider: gitlab
  host: git.example.com
  project: practically-oss/conventional-tools
```
