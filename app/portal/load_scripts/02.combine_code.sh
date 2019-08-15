#!/bin/bash -x

echo src:$src
echo dst:$dst
if [ -z "$src" -o -z "$dst" ]; then 
    echo "src or dst cannot be empty. quit."
    exit 1
fi

cp -r $src/* $dst/
