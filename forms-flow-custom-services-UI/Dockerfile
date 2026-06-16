# Build stage
FROM node:20-alpine AS build-stage

WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh

# Copy package files with node user ownership
COPY --chown=node:node package*.json ./

# Switch to non-root user (node user exists in node:20-alpine)
USER node

# Install dependencies
RUN npm install

# Copy only necessary files
COPY --chown=node:node src/ /app/src/
COPY --chown=node:node webpack.config.js tsconfig.json babel.config.json index.html /app/

# Build the application
RUN npm run build

# Production stage
FROM nginx:stable-alpine AS production-stage

LABEL Name="formsflow"

RUN apk add --no-cache bash && \
    mkdir /app && \
    # Pre-create dirs with nginx ownership so the process can run without root
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d

COPY --from=build-stage --chown=nginx:nginx /app/dist /usr/share/nginx/html

# Copy nginx config
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Switch to non-root nginx user
USER nginx

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
