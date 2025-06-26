
FROM node:18-alpine

WORKDIR /app

# Installa dipendenze
COPY package*.json ./
RUN npm install --production

# Copia il codice
COPY . .

# Espone la porta
EXPOSE 3001

# Avvia l'app
CMD ["npm", "start"]
