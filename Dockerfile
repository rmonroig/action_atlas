# Build Stage
FROM node:20 AS build-stage
WORKDIR /app
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Production Stage
FROM node:20-slim
WORKDIR /app

# Setup Backend
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm install --only=production
COPY backend/ .

# Setup Frontend (Copy build artifacts)
# We place them at ../frontend/dist relative to backend (which is at /app/backend)
# So we copy to /app/frontend/dist
WORKDIR /app
COPY --from=build-stage /app/frontend/dist ./frontend/dist

# Final configuration
WORKDIR /app/backend
ENV NODE_ENV=production
EXPOSE 8080
CMD ["node", "server.js"]
