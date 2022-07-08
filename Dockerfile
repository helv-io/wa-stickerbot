FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
ENTRYPOINT ["ts-node","index.ts"]