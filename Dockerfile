# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# API URL can be overridden at build time:
#   docker build --build-arg VITE_API_URL=https://api.yourdomain.com/api/v1 .
ARG VITE_API_URL=http://localhost:8080/api/v1
ARG VITE_USE_MOCK_DATA=false
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_USE_MOCK_DATA=$VITE_USE_MOCK_DATA

RUN npm run build

# ── Stage 2: Serve with Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
