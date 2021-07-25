FROM node:14.16-alpine

WORKDIR /app/auth

ENV PATH /app/auth/node_modules/.bin:$PATH

COPY package.json ./

RUN npm install --silent

COPY . ./

EXPOSE 3000

CMD [ -d "node_modules" ] && npm run start || npm ci && npm run start