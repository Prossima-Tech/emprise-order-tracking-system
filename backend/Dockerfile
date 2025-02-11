# Development
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install
RUN npx prisma generate

COPY . .

CMD ["sh", "-c", "npx prisma migrate dev --name init && npm run dev"]