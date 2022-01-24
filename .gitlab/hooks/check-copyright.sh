#!/bin/sh
# Copyright 2021-2022 Practically.io All rights reserved
#
# Use of this source is governed by a BSD-style
# licence that can be found in the LICENCE file or at
# https://www.practically.io/copyright/
#
# Checks for a valid Practically.io copyright header the staged files. All files
# need to have a valid copyright header in them with the current year. To
# prevent the headers from getting out of date when editing a files this hook
# will check for a valid copyright date when you try and commit a file into git.
# It will test for two types of headers. The boilerplate BSD licence for
# practically and php style below is examples of valid headers
#
# Copyright 2021 Practically.io All rights reserved
# Copyright 2020-2021 Practically.io All rights reserved
# @copyright 2021 Practically.io All rights reserved
# @copyright 2020-2021 Practically.io All rights reserved
#
# Example hook via conventional-tools as a pre-commit hook
# pre-commit:
#   - $(git rev-parse --show-toplevel)/.gitlab/hooks/check-copyright.sh
set -e

# Configure the files you want to be included licence header in
files="$@"
if [ -z "$files" ]; then
	files=$(git diff --cached --name-only --diff-filter=ACMR \
		"*.php"    \
		"*.js"     \
		"*.jsx"    \
		"*.yml"    \
		"*.sh"     \
		"*.bash")
fi

# Test for noop
if [ -z "$files" ]; then exit 0; fi

ERRORS=""
echo "$files" | sed 's| |\\ |g' |
{
    while IFS= read -r file; do
        COMMENT="#";
        case "$file" in
            *.cs) COMMENT="///";;
            *.php) COMMENT=" \*";;
            *.scss) COMMENT=" \*";;
            *.js*) COMMENT="( \*|\/\/)";;
            *.ts*) COMMENT="( \*|\/\/)";;
        esac

        if [ -z "$(grep -E "^$COMMENT (@c|C)opyright\s+([0-9]{4}-)?$( date +"%Y") Practically.io All rights reserved$" "$file")" ]; then
            ERRORS="$ERRORS  - $file\n"
        fi
    done

    if [ ! -z "$ERRORS" ]; then
        echo "Some files have invalid copyright headers. Please ensure"
        echo "the following files include a valid copyright header like"
        echo ""
        echo "Copyright $( date +"%Y") Practically.io All rights reserved"
        echo ""
        echo "Files:"
        echo "$ERRORS"

        exit 1
    fi
}
