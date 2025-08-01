#!/bin/bash

# Setup SSL certificates for pathyvo.app using Let's Encrypt
# Run this script on your DigitalOcean droplet

set -e

DOMAIN="pathyvo.app"
EMAIL="your-email@example.com"  # Replace with your actual email

echo "🔐 Setting up SSL certificates for $DOMAIN"

# Install certbot if not already installed
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    sudo apt update
    sudo apt install -y certbot
fi

# Create directories
sudo mkdir -p /var/www/certbot
sudo mkdir -p ./ssl

# Stop existing containers
echo "🛑 Stopping existing containers..."
sudo docker-compose down

# Create temporary nginx config for initial certificate generation
cat > nginx-temp.conf << EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name $DOMAIN www.$DOMAIN;
        
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 200 'OK';
            add_header Content-Type text/plain;
        }
    }
}
EOF

# Start temporary nginx container for certificate generation
echo "🚀 Starting temporary nginx for certificate generation..."
sudo docker run -d --name temp-nginx \
    -p 80:80 \
    -v "$(pwd)/nginx-temp.conf:/etc/nginx/nginx.conf" \
    -v "/var/www/certbot:/var/www/certbot" \
    nginx:alpine

# Wait a moment for nginx to start
sleep 5

# Generate certificates
echo "📜 Generating SSL certificates..."
sudo certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

# Stop temporary nginx
echo "🛑 Stopping temporary nginx..."
sudo docker stop temp-nginx
sudo docker rm temp-nginx

# Copy certificates to local ssl directory
echo "📋 Copying certificates..."
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/
sudo chmod 644 ./ssl/fullchain.pem
sudo chmod 600 ./ssl/privkey.pem

# Create certificate renewal script
cat > renew-ssl.sh << EOF
#!/bin/bash
echo "🔄 Renewing SSL certificates..."
sudo certbot renew --quiet
sudo cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ./ssl/
sudo docker-compose exec nginx nginx -s reload
echo "✅ Certificate renewal completed"
EOF

chmod +x renew-ssl.sh

# Add cron job for automatic renewal
echo "⏰ Setting up automatic certificate renewal..."
(sudo crontab -l 2>/dev/null; echo "0 12 * * * cd $(pwd) && ./renew-ssl.sh") | sudo crontab -

# Clean up
rm nginx-temp.conf

echo "✅ SSL setup completed!"
echo "🚀 You can now start your application with: sudo docker-compose up -d"
echo "🔄 Certificates will auto-renew via cron job"