# Builder stage
FROM node:18 AS builder

WORKDIR /usr/src/app

# Copy only package files for installing dependencies
COPY package*.json yarn.lock ./

RUN yarn install

# Copy the rest of the app files
COPY . .

# Build the app
RUN yarn build

# Runtime stage
FROM node:18-alpine AS runtime

WORKDIR /usr/src/app

# Only copy necessary files from the builder
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/.next ./.next

# Install only production dependencies
RUN yarn install --production --frozen-lockfile

EXPOSE 3000

CMD ["yarn", "start"]
