# FROM node:20-alpine

# WORKDIR /app

# COPY package*.json ./
# RUN npm install --omit=dev

# COPY . .

# EXPOSE 4000

# ENV NODE_ENV=production

# CMD ["npm", "start"]

FROM node:20-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .
# Si usás TypeScript:
# RUN npm run build

ENV NODE_ENV=production
# Render te pone PORT. Tu server debe usar process.env.PORT || 4000
EXPOSE 4000

# Para JS:
CMD ["npm", "start"]
# Para TS (compilado):
# CMD ["node", "dist/index.js"]
