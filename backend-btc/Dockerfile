FROM node:16 

ARG PROD
ARG PRIVATE_KEY
COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .
RUN yarn build


EXPOSE 3000
CMD yarn serve
