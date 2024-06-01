FROM --platform=linux/amd64 node:16 
WORKDIR /app

COPY package.json ./
COPY yarn.lock ./

RUN yarn

COPY . .

EXPOSE 3000
CMD yarn build && yarn serve