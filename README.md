# Team Track - Employee Management System

A comprehensive employee management system built with Next.js 15, PayloadCMS 3.x, and PostgreSQL.

## Features

- 👥 **User Management**: Complete employee profiles with departments, roles, and documents
- 📊 **Payroll System**: Automated payroll generation, additional payments, and adjustments
- 📦 **Inventory Management**: Track company assets, assignments, and status
- 🏖️ **Leave Management**: Handle leave requests, approvals, and tracking
- 🔐 **RBAC**: Role-based access control with granular permissions
- 📱 **Responsive Design**: Mobile-friendly interface with drawer navigation
- 🎨 **Modern UI**: Built with Shadcn UI components and Tailwind CSS

## Quick Start - Local Development

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables. Update `DATABASE_URI` so it points at your local or remote PostgreSQL instance.
3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. Open `http://localhost:3000` to use the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URI` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URI` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development); the docker-compose file will automatically use the `.env` file in your project root.
2. Run `docker compose up db` to start PostgreSQL (the default credentials come from `.env`).
3. Run `docker compose up app` in a second terminal to start the Next.js/Payload container.
4. Follow [step 4 from above](#development) to create your first admin user at `/admin`.

The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## 🚀 Production Deployment

### Docker + Hetzner Overview

The repository ships with:

- `Dockerfile` optimised for multi-stage builds
- `docker-compose-dev.yml` and `docker-compose-prod.yml` for dev/prod stacks (app + PostgreSQL + nginx + certbot)
- `nginx.conf` and `nginx-dev.conf` reverse proxies ready for Let's Encrypt certificates
- `.github/workflows/CI-CD.yml` GitHub Actions workflow that builds/pushes images to GHCR and deploys over SSH

At a high level the deployment flow is:

1. Each push to `dev` or `main` runs CI, builds the Next.js/Payload image, and pushes to GitHub Container Registry.
2. The workflow SSHes into your Hetzner box, pulls the fresh image, runs Payload migrations, then restarts the app + nginx via Docker Compose.
3. Certbot + nginx handle TLS termination (you only need to supply the domain certificates path on the server).

#### Prepare Your Server

1. Install Docker and Docker Compose plugin (`sudo apt update && sudo apt install docker-ce docker-compose-plugin`).
2. Create the deployment directory (for example `/srv/team-track`) and clone this repository there.
3. Provision directories for certificates and shared media (defaults can be adjusted in `docker-compose-*.yml`).
4. Populate `.env` with production secrets (`DATABASE_URI`, `PAYLOAD_SECRET`, mail provider settings, etc.).

#### Configure GitHub Actions

Add the following repository secrets:

- `DEV_ENV` / `PROD_ENV`: Base64-encoded `.env` files for each environment.
- `DEV_SSH_HOST`, `DEV_SSH_PORT`, `DEV_SSH_USER`, `DEV_PRIVATE_KEY`, `DEV_DEPLOY_PATH` (repeat with `PROD_*`).
- Optionally override `GITHUB_OWNER`/`IMAGE_TAG` via secrets if your deploy path differs.

Push to the corresponding branch (`dev` or `main`) to trigger the pipeline.

#### Manual Deploy Alternative

If you prefer manual deploys:

1. Build the image locally: `docker build -t ghcr.io/<owner>/team-track:manual .`
2. Push to your registry (or load it on the server).
3. Upload a `.env` file to the server and run `docker compose -f docker-compose-prod.yml up -d`.
4. Run migrations: `docker compose -f docker-compose-prod.yml run --rm migrate`.
5. Restart nginx: `docker compose -f docker-compose-prod.yml restart nginx`.

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.4 with App Router
- **CMS**: PayloadCMS 3.x
- **Database**: PostgreSQL (local or Supabase)
- **UI**: Shadcn UI + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Authentication**: PayloadCMS built-in auth
- **Deployment**: Docker (Hetzner via GHCR + Compose)

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
