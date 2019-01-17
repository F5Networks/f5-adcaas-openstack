#!/bin/bash

cdir=$(cd `dirname $0`; pwd)
(
  cd $cdir
  ./start_pg.sh && ./start_app.sh
)

