FROM node:latest
RUN apt update && \
    apt install -y \
    build-essential \
    ca-certificates \
    chromium \
    ffmpeg \
    fonts-liberation \
    gconf-service \
    libappindicator1 \
    libasound2 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcairo2-dev \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm-dev \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libgif-dev \
    libglib2.0-0 \
    libgtk-3-0 \
    libjpeg-dev \
    libnss3 \
    libnspr4 \
    libpango1.0-dev \ 
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    librsvg2-dev \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget \
    xdg-utils
WORKDIR /usr/src/app
COPY . .
RUN npm run build
EXPOSE 3000
ENTRYPOINT ["node"]
CMD ["dist/dist.js"]