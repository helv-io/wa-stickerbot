FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN apt update && \
    apt -y \
    install  \
    chromium \
    ffmpeg \
    libmp3lame0
RUN npm i
RUN npm i -g ts-node
EXPOSE 13579
ENTRYPOINT ["ts-node","index.ts"]