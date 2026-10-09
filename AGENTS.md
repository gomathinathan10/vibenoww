# Workspace Guidelines & Constraints: VibeNoww

## 1. Local Development Only (STRICT)
- **All development and changes must happen strictly in `localhost` (`d:\vn`).**
- **DO NOT attempt to deploy, upload, or push files to Hostinger or any remote server.**
- **DO NOT run any scripts that execute remote FTP/SFTP, SSH, or direct remote database queries.**
- The live production site at `https://vibenoww.com` must remain completely untouched, operational, and isolated.
- Deployments to production must ONLY occur when the user explicitly instructs to deploy.

## 2. Environment & Servers
- **Frontend**: Vite dev server at `http://localhost:5173/`
- **Backend**: Express API server at `http://localhost:5001/` (proxied by Vite)
- **Deployment scripts**: Quarantined inside `.disconnected_hostinger_deployment/` and must not be run during local development.
