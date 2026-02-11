# Simple Dockerfile for testing container upload
FROM nginx:alpine

# Copy built assets to nginx html directory
COPY build /usr/share/nginx/html

# Expose port 8080 (required by Meticulous)
EXPOSE 8080

# Configure nginx to listen on port 8080
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf

# Health check endpoint
HEALTHCHECK --interval=10s --timeout=3s --start-period=5s \
  CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1
