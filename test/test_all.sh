#!/bin/bash -e

npm install mocha request chai supertest --save

mocha -b *.js
