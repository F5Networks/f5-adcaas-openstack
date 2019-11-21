#!/bin/bash 

cdir=`cd $(dirname $0); pwd`

target=$cdir/../dist

mkdir -p $target
rm -rf $target/*

for n in scripts deploy data dependencies; do 
    mkdir -p $target/$n
done

for n in download_do.sh	download_as3.sh	generate_certs.sh start_all.sh download_asg_dependencies.sh; do 
    cp $cdir/$n $target/scripts
done

for n in appcluster.rc docker-compose.yml docker-compose-efk.yml kibana.yml fluentd.conf unset-wafaas-environs.rc docker; do 
    cp -r $cdir/../deploy/$n $target/deploy
done

cp -r $cdir/../data/* $target/data
for n in `ls $cdir/../data`; do
    (
        cd $target/data/$n
        if [ ! -f .gitignore ]; then exit; fi
        echo >> .gitignore
        cat .gitignore | while read line; do
            if [ -z "$line" ]; then continue; fi;
            rm -rf $line
        done
        rm -f .gitignore
    )
done

cp -r $cdir/../dependencies/* $target/dependencies

(
    cd $target
    which tree > /dev/null
    if [ $? -eq 0 ]; then tree .; else find .; fi
)
