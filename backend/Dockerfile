
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
COPY . .

RUN npx prisma generate

EXPOSE 5000

CMD ["npm", "start"]
