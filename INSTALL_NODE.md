Install NodeJS + NPM + CLI
```
curl -sL install-node.now.sh/lts | sh
npm i -g @proton/cli
```

If you get a missing write access error on Mac/Linux, first run:
```
sudo chown -R $USER /usr/local/lib/node_modules
sudo chown -R $USER /usr/local/bin
```

Install NodeJS + NPM + CLI (on M1 Mac through brew + NVM)
```
softwareupdate --install-rosetta
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install nvm
nvm use 16
npm -v
```