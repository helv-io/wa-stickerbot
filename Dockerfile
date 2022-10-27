FROM node:latest
WORKDIR /usr/src/app
COPY . .
RUN npm install
RUN npm install -g ts-node
RUN wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - \ 
    && echo "deb http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list
RUN apt-get update && \
    apt-get -y \
    install google-chrome-stable \
    ffmpeg \
    libmp3lame0 \
    wget \
    sox \
    alsa-utils \
    espeak \
    jq \
    libportaudio2 \
    libatlas3-base
RUN wget https://github.com/synesthesiam/voice2json/releases/download/v2.1/voice2json_2.1_amd64.deb && dpkg -i voice2json_2.1_amd64.deb && rm voice2json_2.1_amd64.deb
RUN ln -s /usr/lib/x86_64-linux-gnu/libffi.so.7 /usr/lib/x86_64-linux-gnu/libffi.so.6
EXPOSE 13579
ENTRYPOINT ["ts-node","index.ts"]