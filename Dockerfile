FROM node:9.8
MAINTAINER Shane Burkhart <shaneburkhart@gmail.com>

RUN mkdir -p /app
WORKDIR /app

ADD . /app

RUN npm install

CMD ["npm", "start"]
