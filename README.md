# Docker UI - Web-based Docker Management Interface

A modern, responsive web interface for managing Docker containers, images, and networks. Built with Next.js 15, TypeScript, and Tailwind CSS.

![Docker UI](https://img.shields.io/badge/Docker-UI-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Features

- **🐳 Container Management**
  - View all running and stopped containers
  - Start, stop, and restart containers individually or in bulk
  - Real-time container logs with Server-Sent Events (SSE)
  - Container details including ports, volumes, and environment variables

- **📦 Image Management**
  - View all Docker images with size and creation date
  - Remove images individually or in bulk
  - Repository and tag information display

- **🌐 Network Management** *(Ready for implementation)*
  - View Docker networks
  - Network details and connected containers

- **✨ Modern UI/UX**
  - Responsive design that works on all devices
  - Dark terminal-style logs viewer with filtering
  - Real-time updates and status indicators
  - Professional design with smooth animations
  - Auto-scroll logs with toggle option

## 🖥️ Screenshots

*Add screenshots of your application here when ready*

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Docker** or **Colima** running on your system
- Docker socket accessible (usually `/var/run/docker.sock` or Colima socket)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd docker-online-ui
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

## 🐳 Docker Setup

### For Docker Desktop Users
The application should work out of the box with Docker Desktop.

### For Colima Users (macOS)

1. **Start Colima with Docker socket**
   ```bash
   colima start --docker-socket
   ```

2. **Verify Docker context**
   ```bash
   docker context inspect colima --format "{{.Endpoints.docker.Host}}"
   ```

The application automatically detects Colima's socket path.

### For Linux Users

Ensure your user has access to the Docker socket:
```bash
sudo usermod -aG docker $USER
# Log out and back in, or run: newgrp docker
```

## 📁 Project Structure

```
src/
├── app/                          # Next.js 15 App Router
│   ├── api/                      # API routes
│   │   ├── containers/           # Container management endpoints
│   │   │   └── [containerId]/    # Container actions (start/stop/restart)
│   │   ├── images/               # Image management endpoints
│   │   ├── docker-info/          # Docker connection status
│   │   └── logs/[containerId]/   # SSE logs streaming
│   ├── containers/[id]/          # Container details and logs page
│   ├── images/                   # Images management page
│   └── page.tsx                  # Home page (containers overview)
├── components/                   # Reusable UI components
│   ├── Navbar.tsx               # Navigation with Docker status
│   ├── StatsCard.tsx            # Metric display cards
│   ├── ActionButton.tsx         # Consistent button styles
│   ├── ContainerCard.tsx        # Container display component
│   └── ImageCard.tsx            # Image display component
├── hooks/                       # Custom React hooks
│   └── useDocker.ts             # Docker API hooks (containers, images, etc.)
├── lib/                         # Core utilities
│   └── docker.ts                # Docker API integration with Dockerode
└── services/                    # Service layer
    └── networkService.ts        # API service methods and interfaces
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (optional):

```bash
# Docker socket path (auto-detected if not set)
DOCKER_SOCKET_PATH=/var/run/docker.sock

# For custom Docker daemon
DOCKER_HOST=unix:///path/to/docker.sock
```

### Automatic Docker Socket Detection

The application automatically detects:
1. **Docker Desktop** socket (`/var/run/docker.sock`)
2. **Colima** socket via `docker context inspect colima`
3. Falls back to user-specific Colima path: `/Users/$USER/.colima/default/docker.sock`

## 🛠️ Development

### Tech Stack

- **Framework**: Next.js 15 with App Router and Server Components
- **Language**: TypeScript with strict type checking
- **Styling**: Tailwind CSS with custom design system
- **Docker Integration**: Dockerode library with custom wrapper
- **Real-time**: Server-Sent Events (SSE) for live logs
- **State Management**: Custom React hooks with error handling

### Architecture Patterns

- **Service Layer**: Clean API abstraction in `networkService.ts`
- **Custom Hooks**: React hooks for data fetching and state management
- **Component-Based**: Reusable UI components with TypeScript props
- **API Routes**: Next.js API routes with proper error handling
- **Type Safety**: Full TypeScript implementation with interfaces

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

### Adding New Features

Follow this pattern for consistency:

1. **Add Docker API method** in `lib/docker.ts`
2. **Create API endpoint** in `app/api/`
3. **Add service method** in `services/networkService.ts`
4. **Create custom hook** in `hooks/useDocker.ts`
5. **Build UI components** and pages

Example for adding volumes support:
```typescript
// lib/docker.ts
export const docker = {
  async listVolumes() {
    const instance = await getDockerInstance();
    return instance.listVolumes();
  }
};

// app/api/volumes/route.ts
export async function GET() {
  try {
    const volumes = await docker.listVolumes();
    return NextResponse.json({ volumes });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch volumes' }, { status: 500 });
  }
}
```

## 🔒 Security Considerations

- The application requires access to Docker socket
- Docker socket access provides **full Docker daemon control**
- Run with appropriate user permissions
- Consider firewall rules for production deployment
- **Never expose** Docker socket to untrusted networks
- Use reverse proxy with authentication for production

## 📦 Production Deployment

### Docker Compose (Recommended)

```yaml
version: '3.8'
services:
  docker-ui:
    build: .
    ports:
      - "3000:3000"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    restart: unless-stopped
    environment:
      - NODE_ENV=production
```

### Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
RUN npm ci --only=production && npm cache clean --force
EXPOSE 3000
ENV NODE_ENV=production
CMD ["npm", "start"]
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # For SSE (Server-Sent Events)
        proxy_buffering off;
        proxy_cache off;
    }
}
```

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use ESLint configuration provided
- Add proper error handling
- Include type definitions
- Test with both Docker Desktop and Colima
- Ensure responsive design

## 📋 Roadmap

- [ ] **Networks Management**: Create, delete, and inspect Docker networks
- [ ] **Volume Management**: Manage Docker volumes and bind mounts
- [ ] **Docker Compose**: Support for compose files and stacks
- [ ] **System Monitoring**: Resource usage charts and metrics
- [ ] **Container Creation**: UI for running new containers
- [ ] **Image Management**: Pull images from registries
- [ ] **User Authentication**: Multi-user support with permissions
- [ ] **Themes**: Dark/light mode toggle
- [ ] **Export/Import**: Configuration backup and restore
- [ ] **Container Terminal**: Web-based container shell access

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to Docker daemon"**
```bash
# Check if Docker is running
docker ps

# For Colima users
colima status
colima start
```

**"Permission denied accessing Docker socket"**
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Restart terminal or run:
newgrp docker
```

**"Port 3000 already in use"**
```bash
# Use different port
npm run dev -- -p 3001
# Or kill process using port 3000
lsof -ti:3000 | xargs kill -9
```

**"Module not found" errors**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode

Enable debug logging:
```bash
# Set debug environment
DEBUG=docker-ui:* npm run dev

# Check Docker socket path
ls -la /var/run/docker.sock
```

### Colima-specific Issues

```bash
# Restart Colima with Docker socket
colima stop
colima start --docker-socket

# Check Colima Docker context
docker context use colima
docker context inspect colima
```

## 📊 Performance

- **SSE Connection**: Efficient real-time log streaming
- **Component Caching**: React component memoization
- **API Optimization**: Minimal Docker API calls
- **Bundle Size**: Optimized Next.js build
- **Responsive**: Works on mobile and desktop

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Docker](https://docker.com) - Containerization platform
- [Next.js](https://nextjs.org) - React framework
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [Dockerode](https://github.com/apocas/dockerode) - Docker API client
- [Colima](https://github.com/abiosoft/colima) - Container runtime for macOS

## 📞 Support & Community

- **Issues**: [GitHub Issues](https://github.com/Owaiseimdad/docker-online-ui/issues)

---

**⭐ Star this repository if you found it helpful!**

*Made with ❤️ for the Docker community*