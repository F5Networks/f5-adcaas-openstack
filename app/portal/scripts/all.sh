#!/bin/bash 

source `dirname $0`/cdir.rc
source $cdir/venv.rc

(
    cd $cdir/../horizon
    python manage.py collectstatic --no-input
    python manage.py compress --force
    python manage.py runserver 0:80
)

