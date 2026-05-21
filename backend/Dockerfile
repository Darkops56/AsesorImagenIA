FROM node:18-alpine

WORKDIR /app

# Instalar dependencias primero (aprovechar caché de Docker)
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto
EXPOSE 3000

# Usamos npm run dev para habilitar recarga en caliente con nodemon si está configurado,
# o para usar el script dev por defecto
CMD ["npm", "run", "dev"]
