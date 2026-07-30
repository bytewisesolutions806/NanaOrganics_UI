# Deploy Nana Organics to Amazon EC2 with Docker

This guide deploys the Next.js storefront as a production Docker container on a single Ubuntu EC2 instance. The container listens on port `3001`; Nginx listens publicly on ports `80` and `443` and proxies requests to it.

## Architecture

```text
Browser -> EC2 security group -> Nginx (80/443) -> Docker container (127.0.0.1:3001)
                                                   -> Vendure Shop API
```

The Docker image uses Next.js standalone output, runs as a non-root user, includes a health check, and does not copy local environment files into the image.

## Prerequisites

- An EC2 instance running Ubuntu 22.04 or 24.04.
- An Elastic IP or stable DNS record for the instance.
- At least 2 GB RAM for building on the instance. For smaller instances, build the image in CI and pull it from Amazon ECR instead.
- A public HTTPS Vendure Shop API URL that is reachable by customers' browsers.

Configure the EC2 security group with:

| Port | Source | Purpose |
| --- | --- | --- |
| `22` | Your fixed public IP only | SSH administration |
| `80` | `0.0.0.0/0` and optionally `::/0` | HTTP and certificate validation |
| `443` | `0.0.0.0/0` and optionally `::/0` | HTTPS storefront traffic |

Do not expose port `3001` publicly when Nginx runs on the same instance.

AWS documents the recommended web-server rules in its [EC2 security-group reference](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules-reference.html). Restricting SSH to your own IP is also recommended by [AWS EC2 guidance](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/changing-security-group.html).

## 1. Install Docker on EC2

SSH into the instance and install Docker from Docker's official Ubuntu repository:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

echo "Types: deb
URIs: https://download.docker.com/linux/ubuntu
Suites: $(. /etc/os-release && echo \"${UBUNTU_CODENAME:-$VERSION_CODENAME}\")
Components: stable
Architectures: $(dpkg --print-architecture)
Signed-By: /etc/apt/keyrings/docker.asc" | sudo tee /etc/apt/sources.list.d/docker.sources > /dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo systemctl enable --now docker
sudo docker run --rm hello-world
```

See [Install Docker Engine on Ubuntu](https://docs.docker.com/engine/install/ubuntu/) for supported Ubuntu versions and updated installation instructions.

## 2. Copy the application to EC2

Clone the repository or transfer a release archive, then enter the project directory:

```bash
git clone <YOUR_REPOSITORY_URL> nana-ui
cd nana-ui
```

Do not commit `.env.local`, `.env.production`, private keys, or credentials.

## 3. Create the production configuration

Create `.env.production` on the EC2 instance:

```dotenv
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_VENDURE_SHOP_API_URL=https://api.example.com/shop-api
NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN=
ALLOW_LOCAL_IMAGE_IP=false
```

Replace the example URLs with the production API URLs. Values beginning with `NEXT_PUBLIC_` are visible in browser JavaScript and must not contain secrets. Next.js embeds them during `next build`, so changing this file requires rebuilding the image.

The channel token is optional. Leave it empty if the Vendure channel does not require one.

## 4. Build the image

Load the configuration into the current shell and pass the public values as build arguments:

```bash
set -a
source .env.production
set +a

sudo docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL \
  --build-arg NEXT_PUBLIC_USE_MOCK_API \
  --build-arg NEXT_PUBLIC_VENDURE_SHOP_API_URL \
  --build-arg NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN \
  --build-arg ALLOW_LOCAL_IMAGE_IP \
  --tag nana-ui:latest \
  .
```

`NEXT_PUBLIC_VENDURE_SHOP_API_URL` is required. The Docker build stops with a clear error if it is missing.

## 5. Start the container

Bind the app only to EC2's loopback interface so it can be reached by Nginx but not directly from the internet:

```bash
sudo docker run -d \
  --name nana-ui \
  --restart unless-stopped \
  --publish 127.0.0.1:3001:3001 \
  nana-ui:latest
```

Check its status and health:

```bash
sudo docker ps
sudo docker inspect --format='{{.State.Health.Status}}' nana-ui
curl --fail http://127.0.0.1:3001/
sudo docker logs --tail 100 nana-ui
```

## 6. Configure Nginx

Install Nginx:

```bash
sudo apt-get install -y nginx
```

Create `/etc/nginx/sites-available/nana-ui` with this configuration, replacing `shop.example.com`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name shop.example.com;

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }
}
```

Enable the site and validate the configuration:

```bash
sudo ln -s /etc/nginx/sites-available/nana-ui /etc/nginx/sites-enabled/nana-ui
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

Next.js recommends using a reverse proxy in front of a self-hosted server. See the official [Next.js self-hosting guide](https://nextjs.org/docs/app/guides/self-hosting).

## 7. Enable HTTPS

Point the domain's DNS `A` record to the EC2 Elastic IP. After DNS resolves, obtain a TLS certificate with your preferred certificate automation, such as Certbot, and configure Nginx to redirect HTTP to HTTPS.

Do not place the production site behind plain HTTP: login/session data and customer activity must be protected in transit.

## Deploy an update

Pull the new source, rebuild, replace the old container, and retain the previous image briefly for rollback:

```bash
git pull --ff-only

set -a
source .env.production
set +a

sudo docker tag nana-ui:latest nana-ui:previous
sudo docker build \
  --build-arg NEXT_PUBLIC_API_BASE_URL \
  --build-arg NEXT_PUBLIC_USE_MOCK_API \
  --build-arg NEXT_PUBLIC_VENDURE_SHOP_API_URL \
  --build-arg NEXT_PUBLIC_VENDURE_CHANNEL_TOKEN \
  --build-arg ALLOW_LOCAL_IMAGE_IP \
  --tag nana-ui:latest \
  .

sudo docker stop nana-ui
sudo docker rm nana-ui
sudo docker run -d \
  --name nana-ui \
  --restart unless-stopped \
  --publish 127.0.0.1:3001:3001 \
  nana-ui:latest
```

Confirm the container becomes healthy before considering the release complete.

## Roll back

```bash
sudo docker stop nana-ui
sudo docker rm nana-ui
sudo docker run -d \
  --name nana-ui \
  --restart unless-stopped \
  --publish 127.0.0.1:3001:3001 \
  nana-ui:previous
```

## Troubleshooting

### The container is unhealthy

```bash
sudo docker logs --tail 200 nana-ui
sudo docker inspect nana-ui
curl -v http://127.0.0.1:3001/
```

### The storefront cannot reach Vendure

- Confirm `NEXT_PUBLIC_VENDURE_SHOP_API_URL` is a public URL, not `localhost` or `127.0.0.1`.
- Confirm the Vendure API allows the storefront domain through its CORS configuration.
- Rebuild the image after changing any `NEXT_PUBLIC_*` value.
- In the browser developer tools, inspect the failed Shop API request and its CORS response headers.

### Remote product images fail

The image host must be listed under `images.remotePatterns` in `next.config.mjs`. Add the production host, rebuild the image, and redeploy. Do not enable `ALLOW_LOCAL_IMAGE_IP=true` unless the image source is intentionally hosted on a trusted private address.

### Nginx returns 502 Bad Gateway

Confirm the container is running and that `curl http://127.0.0.1:3001/` succeeds on EC2. Then check:

```bash
sudo nginx -t
sudo journalctl -u nginx --since "15 minutes ago"
```

## Optional: Application Load Balancer

For multiple instances or managed TLS, place an AWS Application Load Balancer in front of EC2. In that topology, publish `3001:3001` rather than binding to `127.0.0.1`, and allow inbound port `3001` on the instance security group only from the load balancer's security group. Never allow public `0.0.0.0/0` access to port `3001`.
