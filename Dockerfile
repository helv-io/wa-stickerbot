FROM node:20-slim
RUN apt update && \
    apt install -y \
    build-essential \
    ffmpeg \
    imagemagick \
    libcairo2-dev \
    libgif-dev \
    libjpeg-dev \
    libpango1.0-dev \
    libpng-dev \
    librsvg2-dev \
    libu2f-udev \
    libvips-dev \
    libxcb1 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /usr/src/app
COPY . .
RUN npm install -g npm@latest
RUN npm install --build-from-source=sharp
RUN npm run build
EXPOSE 3000
VOLUME ["/data"]
ENTRYPOINT ["node"]
CMD ["dist/bot.js"]