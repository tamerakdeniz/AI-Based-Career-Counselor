# 🚀 Pathyvo Deployment Guide

## Step-by-Step Deployment on DigitalOcean

### 1. Initial Setup (HTTP Only - Testing)

First, let's get your domain working with HTTP, then add HTTPS:

```bash
# On your DigitalOcean droplet
cd /path/to/your/Career-Counselor

# Stop current containers
sudo docker-compose down

# Use HTTP-only configuration for testing
cp nginx-http.conf nginx.conf

# Start with new configuration
sudo docker-compose up -d

# Check if containers are running
sudo docker-compose ps
```

### 2. Test Domain Access

After step 1, test if `http://pathyvo.app` works. If it does, proceed to SSL setup.

### 3. SSL Setup (HTTPS)

```bash
# Make the SSL setup script executable
chmod +x setup-ssl.sh

# Edit the script to add your email
nano setup-ssl.sh
# Replace "your-email@example.com" with your actual email

# Run SSL setup
./setup-ssl.sh

# Use the full nginx configuration with SSL
cp nginx.conf.backup nginx.conf  # if you want to restore the original
# or the nginx.conf already has SSL configuration

# Start the application with SSL
sudo docker-compose up -d
```

### 4. Verification Steps

```bash
# Check if all containers are running
sudo docker-compose ps

# Check nginx logs
sudo docker-compose logs nginx

# Check if ports are listening
sudo ss -tuln | grep -E ":80|:443"

# Test SSL certificate
curl -I https://pathyvo.app
```

### 5. Troubleshooting

#### If domain still doesn't work:

1. **Check DNS propagation:**
   ```bash
   nslookup pathyvo.app
   dig pathyvo.app
   ```

2. **Check firewall:**
   ```bash
   sudo ufw status
   # If firewall is active, allow HTTP and HTTPS
   sudo ufw allow 80
   sudo ufw allow 443
   ```

3. **Check Docker logs:**
   ```bash
   sudo docker-compose logs frontend
   sudo docker-compose logs backend
   sudo docker-compose logs nginx
   ```

4. **Test local connectivity:**
   ```bash
   # Test if backend is accessible from nginx container
   sudo docker-compose exec nginx wget -qO- http://backend:8000/api/health
   
   # Test if frontend is accessible from nginx container
   sudo docker-compose exec nginx wget -qO- http://frontend:80
   ```

### 6. Certificate Renewal

Certificates will auto-renew via cron job. Manual renewal:

```bash
./renew-ssl.sh
```

### 7. Monitoring

```bash
# Check application status
sudo docker-compose ps

# View real-time logs
sudo docker-compose logs -f

# Check disk space (certificates and logs)
df -h
sudo du -sh /etc/letsencrypt/
```

## Common Issues and Solutions

### Issue 1: ERR_CONNECTION_REFUSED

**Cause:** Nginx not properly routing requests
**Solution:** 
- Check if all containers are running
- Verify nginx configuration
- Check Docker network connectivity

### Issue 2: SSL Certificate Errors

**Cause:** Certificate not properly generated or expired
**Solution:**
- Re-run `./setup-ssl.sh`
- Check if domain points to correct IP
- Verify email in setup script

### Issue 3: API Calls Failing

**Cause:** Backend not accessible through proxy
**Solution:**
- Check backend container logs
- Verify API endpoint configuration
- Test direct backend connectivity

### Issue 4: Static Files Not Loading

**Cause:** Frontend container not serving files properly
**Solution:**
- Check frontend container logs
- Verify build process completed
- Test direct frontend connectivity

## Environment Variables

Make sure your backend `.env` file contains:

```env
# Add these if not present
ALLOWED_HOSTS=pathyvo.app,www.pathyvo.app,localhost,127.0.0.1
CORS_ORIGINS=https://pathyvo.app,https://www.pathyvo.app,http://localhost:3000
```

## Security Considerations

1. **Firewall Configuration:**
   ```bash
   sudo ufw deny 8000  # Block direct backend access
   sudo ufw allow 80   # Allow HTTP
   sudo ufw allow 443  # Allow HTTPS
   sudo ufw allow 22   # Keep SSH access
   ```

2. **Regular Updates:**
   ```bash
   # Update system packages
   sudo apt update && sudo apt upgrade -y
   
   # Update Docker images
   sudo docker-compose pull
   sudo docker-compose up -d
   ```

3. **Backup Certificates:**
   ```bash
   # Backup SSL certificates
   sudo tar -czf ssl-backup-$(date +%Y%m%d).tar.gz /etc/letsencrypt/
   ```

## Performance Optimization

1. **Enable HTTP/2** (already configured in nginx.conf)
2. **Gzip Compression** (already configured)
3. **Static File Caching** (already configured)
4. **Rate Limiting** (already configured)

## Next Steps

1. Monitor application performance
2. Set up log rotation
3. Configure backup strategies
4. Set up monitoring/alerting
5. Consider CDN for static assets