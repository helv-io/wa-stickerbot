FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN apt-get update && \
    apt-get -y \
    install  \
    chromium \
    ffmpeg \
    libmp3lame0
RUN npm install
RUN npm install -g ts-node
EXPOSE 13579
ENTRYPOINT ["ts-node","index.ts"]