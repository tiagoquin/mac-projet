# Bot Discord - Reaction graph

> HEIG - Méthode d'accès aux données
>
> Burgener François, Gabrielli Alexandre, Póvoa Tiago



This bot is based on discord.js. It allows you to track the reactions on a discord server.

## How to start

### Token

To connect your bot to discord, you need to get a token.

Get here: https://discordapp.com/developers

Create a bot, give it a fun picture, and then retrieve your token. You'll need it later

You'll have to go to oAuth page to add your bot to your server. Give it the right permissions and that's it.

Note: you need to give the bot the right to:

* see channels
* write
* send links (So we can use RichEmbed feature)

### Production TODO

Start the topology here: `topology/prod`

### Dev

Start the docker topology here: `topology/dev`

And start the Node server manually:

```
cd bot/
npm install
npm start 
```

Optionellement: `npm run dev` pour démarrer avec nodemon.

Optionally: `npm run dev` to start with nodemon (hot reload).

### Environnement and configuration

Add this configuration file here: `bot/.env`

```
BOT_TOKEN=*INSERT YOUR TOKEN HERE*
PREFIX=!
URI_NEO4J=bolt://localhost
USER_NEO4J=neo4j
PASSWORD_NEO4J=neo4j
```

## Schema

Here is our graph model:

![schema](./img/schema.png)

## Implementation

We have implemented the following:

- [x] Top messages from a user (with the most reactions)
  - [ ] And specify a particular emoji
- [x] Top users who reacted to a user
  - [ ] And specify a particular emoji
  - [ ] Find friends at other depth levels
- [x] Top reactions from a user (Profile)
  - [ ] Find similar profiles
  - [ ] Find users who have similar reactions to someone

## Queries

```
MATCH (:Person{name: '---'})-[*4]-(p:Person)
RETURN p
```

```
MATCH (a:Person { name: '---' }),(b:Person), p = shortestPath((a)-[*..15]-(b))
WHERE a.name <> b.name
WITH collect(b.name) as friends
RETURN friends
```

```
MATCH (a:Person { name: '---' }),(b:Person), p = shortestPath((a)-[*..15]-(b))
WHERE a.name <> b.name
RETURN p
```

## TODO

- [ ] Top messages sans la somme totale, mais par utilisateur différents