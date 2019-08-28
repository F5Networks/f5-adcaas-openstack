# build with:
#   docker build . -t f5devcentral/f5-openstack-services:adcaas-latest

# upload image with (authorized user only)
#   docker push f5devcentral/f5-openstack-services:adcaas-latest

# run with:
#    export <necessary envs> && \
#    docker run -it --name f5-openstack-services-adcaas \
#        -p 3000:3000 \
#        --link postgres-server --link as3-server \
#        f5-openstack-services:adcaas-latest

FROM node:8.16.1-alpine as build

WORKDIR /root/app_dir
COPY . .
RUN rm -rf node_modules
RUN npm install
RUN npm run clean
RUN npm run build
RUN rm -r dist/test


FROM node:8.16.1-alpine as production

LABEL maintainer="F5 Networks Inc. Corp."
EXPOSE 3000/tcp

WORKDIR /root/app_dir
COPY --from=build /root/app_dir/dist ./dist
ADD public public
COPY package.json index.js ./
RUN npm install --production

ENTRYPOINT node index.js
