#!/bin/bash

# $1 denotes the directory name to be copied on ~/Dropbox/Public/
# "$1/rsync-exclude.txt" contains file-name patterns to be ignored
rsync -av --delete --exclude-from="$1/rsync-exclude.txt" $1 ~/Dropbox/Public/
