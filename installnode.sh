#!/usr/bin/env sh

#set -e

echo "Installing nvm..."

curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.32.0/install.sh | bash

NVM_DIR="$HOME/.nvm"
rm -f /etc/profile.d/nvm.sh
cat >> /etc/profile.d/nvm.sh << EOF
export NVM_DIR="$NVM_DIR"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
[ -d "$NVM_DIR/versions/node/v4.5.0" ] && export PATH=$PATH:$NVM_DIR/versions/node/v4.5.0/bin/ && export NODE_PATH=$NVM_DIR/versions/node/v4.5.0/lib/node_modules
EOF
source /etc/profile.d/nvm.sh

echo "Installing Nodejs 4.5.0"
nvm install 4.5.0 

echo "Install nodejs done. \nPlease run 'source /etc/profile.d/nvm.sh' to enable node/npm commands"
