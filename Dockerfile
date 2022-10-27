FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm install -g ts-node
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \ 
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && apt-get -y install google-chrome-stable ffmpeg libmp3lame0 pocketsphinx
EXPOSE 13579
ENTRYPOINT ["ts-node","index.ts"]