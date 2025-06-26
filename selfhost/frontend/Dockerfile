
# Build stage
FROM node:18-alpine as builder

WORKDIR /app

# Copia i file package
COPY package*.json ./
RUN npm install

# Copia il codice sorgente
COPY . .

# Build dell'app per produzione
RUN npm run build

# Production stage
FROM nginx:alpine

# Copia il build nell'immagine nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia la configurazione nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Espone la porta 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
