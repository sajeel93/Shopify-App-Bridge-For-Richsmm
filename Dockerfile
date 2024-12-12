FROM node:18-alpine

# Install openssl (and any other necessary packages)
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

ENV NODE_ENV=production

# Add environment variables
ENV SHOPIFY_APP_URL="https://richsmm.fly.dev"
ENV SHOPIFY_API_KEY="a64a9239b520747b31153c391324030a"
ENV SHOPIFY_API_SECRET="ddf8181e451221834066f8805cd125b5"
ENV DATABASE_URL="postgresql://neondb_owner:Hyec1kK9idtC@ep-broad-mud-a5sazf25.us-east-2.aws.neon.tech/neondb?sslmode=require"


COPY package.json package-lock.json* ./

RUN npm ci --omit=dev && npm cache clean --force
# Remove CLI packages since we don't need them in production by default.
# Remove this line if you want to run CLI commands in your container.
RUN npm remove @shopify/cli

COPY . .

RUN npm run build

CMD ["npm", "run", "docker-start"]
