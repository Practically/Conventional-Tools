#!/bin/sh
# Copyright 2021-2023 Practically.io All rights reserved
#
# Use of this source is governed by a BSD-style
# licence that can be found in the LICENCE file or at
# https://www.practically.io/copyright/
#
# All code checked into the repository should be committed with a
# @practically.io email address. This hook tests to see of your current git
# email address ends with @practically.io.  If this fails you will be prevented
# from commiting without changing your email address
#
# Example hook via conventional-tools as a pre-commit hook
# pre-commit:
#   - $(git rev-parse --show-toplevel)/.gitlab/hooks/check-email.sh
set -e

if [ -z "$(git config user.email | grep -E "@practically.io$")" ]; then
    echo "Invalid email address"
    echo ""
    echo "The commit email address must be a 'practically.io' address but your"
    echo "are using '$(git config user.email)'. Please change to your"
    echo "practically.io email address before commiting"

    exit 1
fi
