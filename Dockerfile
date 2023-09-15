FROM --platform=$BUILDPLATFORM node:20-alpine as builder
WORKDIR /app
COPY yarn.lock package.json ./
RUN yarn install --silent --frozen-lockfile
COPY . .
RUN yarn build

FROM --platform=$TARGETPLATFORM nginx:1.25-alpine as app
COPY --from=builder /app/dist /usr/share/nginx/html/
