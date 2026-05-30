FROM node:18-alpine AS build

WORKDIR /

COPY package.json package-lock.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]


