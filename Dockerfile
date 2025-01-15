FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

# Устанавливаем Angular CLI глобально (чтобы команда 'ng' работала)
RUN npm install -g @angular/cli

# Устанавливаем зависимости, включая devDependencies
RUN npm install --force

COPY . .

EXPOSE 3010

CMD ["npm", "start"]
