FROM node:16

WORKDIR /usr/src/app

COPY package.json ./
COPY tsconfig.json ./
COPY jest.config.js ./
COPY babel.config.js ./

RUN npm install

COPY src/ ./src/
COPY tests/ ./tests/

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
