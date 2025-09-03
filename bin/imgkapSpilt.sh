#!/bin/bash
f=$1
f=`realpath $f`
dName=`dirname $f`
bName=`basename $f`
dCache="$dName/.split"
if [ -d "$dCache" ]; then
    a=""
else
    mkdir "$dCache"
fi

echo "hello imgkapSplit on [$f]"

fNo="$dCache/"${bName:0:-4}

time imgkap "$f" "$fNo"".mheader.kap" "$fNo"".png"