# GAEA
A Saas model for a recycling companies penetration to technology.

## System Requirements
- Ubuntu 18.04 Bionic Beaver

## Deployment 

- Install Nginx by running the following
```
sudo apt update
sudo apt install nginx
sudo ufw allow 'Nginx HTTP'
sudo ufw allow 'Nginx OpenSSH'
sudo ufw enable
sudo systemctl start nginx
```
- Add Nginx server blocks from `blocks` directory in the repo to  `/etc/nginx/sites-enabled` directory in the server
- Install Node.js
```
cd ~
curl -sL https://deb.nodesource.com/setup_8.x -o nodesource_setup.sh
sudo bash nodesource_setup.sh
sudo apt install nodejs
sudo apt install build-essential
```
- clone the repo code
```
cd /var/www
git clone ${repo_url}
```
- Run react build for the compile frontend code
```
cd /var/www/gaea/client
npm install
npm run build
```
- Install PM2 for managing the Node server
```
sudo npm install pm2@latest -g
```
- Start Nodejs server using PM2
```
cd /var/www/gaea/server
pm2 start index
pm2 startup systemd
```
- Restart Nginx
```
sudo service nginx restart
```
