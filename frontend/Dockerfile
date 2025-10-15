# Multi-stage: build Angular app then serve with nginx
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent
COPY . .
RUN npm run build --if-present

FROM nginx:alpine
COPY --from=build /app/dist/explora /usr/share/nginx/html
# copy runtime env (assets)
COPY --from=build /app/src/assets/env.js /usr/share/nginx/html/assets/env.js
EXPOSE 80

