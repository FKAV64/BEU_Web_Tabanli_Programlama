FROM node:18-alpine

RUN apk add --no-cache openssl

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
