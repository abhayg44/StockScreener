FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY .env .env

COPY . .

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000
RUN sed -i 's/80;/3000;/' /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]