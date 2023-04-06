# Getting Started

## Installation

### NPM

A [npm package](https://www.npmjs.com/package/@practically/conventional-tools)
is available of the latest stable. You can install it globally with the below
command.

```sh
npm i -g @practically/conventional-tools
```

### Docker

There is a docker build of the `1.x` branch. This is meant to be used in CI
however there is no reason you can't use it locally if you want to run it in a
confined environment

```sh
docker run --rm -it practically/conventional-tools:1.x:latest conventional-tools --help
```

### Source

If you want to install the cli from source you will need npm or yarn installed.
The below example is installing with yarn on a linux biased environment.

```sh
#
# Clone the source
#
git clone https://git.zportal.co.uk/practically-oss/conventional-tools.git ~/.local/share/conventional-tools
#
# Move to the source directory
#
cd ~/.local/share/conventional-tools
#
# Install dependencies and build
#
yarn install && yarn prepack
#
# Link the exe to the bin directory
#
ln -s ~/.local/share/conventional-tools/bin/run ~/.local/bin/conventional-tools
```
