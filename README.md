# Zulip Lichess bot

Multi-purpose Zulip bot for the Lichess workspace.

## Usage

## Setup

In Zulip, go to Settings -> Your bots, and add a new bot.

You may name it `zuli` as I did, or anything else you like.

After it's created, download its `zuliprc` file and put it at the root of this project.

```
yarn install
yarn dev
```

And you're set, try using it from your Zulip instance.

## Production

Build a prod release:

```
yarn build
```

Deploy it to a server:

```
rsync -av zuliprc dist node_modules user@server:/home/zulip-lichess/
```

Start it on the server:

```
node dist/index.js
```

### Systemd service definition

```
[Unit]
Description=Zulip Lichess bot
After=network.target

[Service]
User=root
Group=root
WorkingDirectory=/home/zulip-lichess
ExecStart=/usr/bin/node dist/index.js
Restart=always

[Install]
WantedBy=multi-user.target
```
