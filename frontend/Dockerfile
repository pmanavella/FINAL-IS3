# Etapa 1: build
# FROM node:20-alpine AS build

# WORKDIR /app

# COPY package*.json ./
# RUN npm install

# COPY . .
# RUN npm run build

# Etapa 2: nginx para servir archivos estáticos
# FROM nginx:alpine

# COPY --from=build /app/dist /usr/share/nginx/html

# EXPOSE 80

# CMD ["nginx", "-g", "daemon off;"]

# NEW

# Etapa 1: build
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Copia resto del código
COPY . .
# Si necesitás apuntar a una API distinta por build: ARG VITE_API_BASE
# RUN VITE_API_BASE=$VITE_API_BASE npm run build
RUN npm run build

# Etapa 2: nginx para servir estáticos
FROM nginx:alpine
# Config SPA: fallback a index.html
COPY <<'NGINX' /etc/nginx/conf.d/default.conf
server {
  listen 80;
  server_name _;
  root /usr/share/nginx/html;

  location / {
    try_files $uri /index.html;
  }

  location /assets/ {
    try_files $uri =404;
  }
}
NGINX

COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
