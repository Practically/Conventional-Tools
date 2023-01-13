#!/bin/sh
# Copyright 2021-2023 Practically.io All rights reserved
#
# Use of this source is governed by a BSD-style
# licence that can be found in the LICENCE file or at
# https://www.practically.io/copyright/
#
# Prevent any file with the extension of `.yaml` from being checked into the
# repository. All Yaml files must use the file extension `.yml` to keep
# everything consistent. If this hook find any `.yaml` files you will not be
# able to check them in and prompted to rename them

# Example hook via conventional-tools as a pre-commit hook
# pre-commit:
#   - $(git rev-parse --show-toplevel)/.gitlab/hooks/no-yaml-files.js
set -e

files=$(git diff --cached --name-only --diff-filter=ACMR "*.yaml" | sed 's| |\\ |g' | sort)
if [ ! -z "$files" ]; then
    echo "One or more '.yaml' files have been added to keep with naming conventions"
    echo "it is recommended to change them to '.yml' files"
    echo ""
    echo "$ERRORS"

    exit 1
fi
