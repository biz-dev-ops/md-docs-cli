FROM node:latest

RUN apt-get update

# Installing JDK
RUN apt-get install -y openjdk-17-jdk openjdk-17-jre

# Install md-docs dependencies
RUN apt-get install -y graphviz libxkbcommon-x11-0 libgbm-dev

# Install Puppeteer dependencies
RUN apt-get install -y gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgcc-s1 libgconf-2-4 libgdk-pixbuf2.0-0 \
    libglib2.0-0 libgtk-3-0 libnspr4 libpango-1.0-0 libpangocairo-1.0-0 \
    libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 \
    libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
    libxtst6 ca-certificates fonts-liberation libappindicator3-1 libnss3 \
    lsb-release xdg-utils wget

# Disable NPM SSL check
ENV NODE_TLS_REJECT_UNAUTHORIZED=0

# Upgrading NPM to latest version
RUN npm install -g npm

# Installing md-docs version 1.0.93
RUN npm i -g @synion/md-docs
