#!/bin/bash 

export OS_AUTH_URL='http://example.org'

python manage.py collectstatic --no-input
python manage.py compress --force
