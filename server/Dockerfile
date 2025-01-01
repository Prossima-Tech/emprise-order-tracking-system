FROM node:20-alpine3.18

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma/

# Generate Prisma Client
RUN npx prisma generate

# Copy the rest of the application
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]