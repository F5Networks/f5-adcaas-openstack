# build with:
#   docker build . -t f5devcentral/f5-openstack-services:latest

# upload image with (authorized user only)
#   docker push f5devcentral/f5-openstack-services:latest

# run with:
#    export <necessary envs> && \
#    docker run -it --name f5-openstack-services-api \
#        -p 3000:3000 \
#        --link postgres-server --link as3-server \
#        f5-openstack-services:latest

FROM node:11-alpine

LABEL maintainer="F5 Networks Inc. Corp."
EXPOSE 3000/tcp

WORKDIR /root/app_dir
ADD dist dist
RUN rm -r dist/test
ADD public public
COPY package.json index.js ./
RUN npm install --production

ENTRYPOINT node index.js
