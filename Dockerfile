FROM node:alpine
RUN apk add --no-cache chromium ffmpeg lame
RUN ln -s /usr/bin/chromium-browser /usr/bin/chromium
WORKDIR /usr/src/app
COPY . .
RUN npm run build
EXPOSE 3000
ENTRYPOINT ["node"]
CMD ["dist/dist.js"]