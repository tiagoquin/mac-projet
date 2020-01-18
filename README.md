# Bot Discord - Reaction graph

> HEIG - Méthode d'accès aux données
>
> Burgener François, Gabrielli Alexandre, Póvoa Tiago



This bot is based on discord.js. It allows you to track the reactions on a discord server and build a cool graph database. 

## How to start

![demo-reactions](img/demo-reactions.png)

### Token

To connect your bot to discord, you need to get a token.

Get here: https://discordapp.com/developers

Create a bot, give it a fun picture, and then retrieve your **token**. You'll need it later

You'll have to go to oAuth page to add your bot to your server. Give it the right permissions and that's it.

Note: you need to give the bot the right to:

* see channels
* write
* send links (So we can use RichEmbed feature)

### Environnement and configuration

You'll have to create a `.env` file in order to add the env variables.

The following is an example of how to do it:

```
BOT_TOKEN=*INSERT YOUR TOKEN HERE*
PREFIX=!
URI_NEO4J=bolt://localhost
USER_NEO4J=neo4j
PASSWORD_NEO4J=neo4j
```

Now let's see where to use it.

### Production

To start the project, add your `.env` file here: `topology/prod`.

then run it with `docker-compose up` from this same folder.

Now you can track all the nasty messages from your friends as soon as someone reacts to it. Enjoy :smile:

### Dev

Start the docker topology here: `topology/dev` so you can have the databases ready.

Then add your `.env` file here: `bot/node-bot/`

And start the Node server manually:

```
npm install
npm start 
```

Optionally: `npm run dev` to start with nodemon (hot reload, wow).

## How it works

### Schema

Here is our graph model:

![schema](./img/schema.png)



### What we did

We have implemented the following (from the spec):

- [x] Top messages from a user (with the most reactions)
  - [ ] And specify a particular emoji
- [x] Top users who reacted to a user
  - [ ] And specify a particular emoji
  - [x] Find friends at other depth levels (In our implem. you can find at 2nd lvl of depth)
- [x] Top reactions from a user (Profile)
  - [ ] Find similar profiles
  - [ ] Find users who have similar reactions to someone

And added some other features:

- [x] Find the path between you and another user

### Queries

##### Shortest path between a user and a target

```cypher
MATCH (start:Person { name: $source }),(end:Person { name: $target }), p = shortestPath((start)-[*]-(end))
                                                                                        UNWIND nodes(p) AS n
WITH n
WHERE 'Person' IN LABELS(n)
RETURN n.name AS Names
```

First line, we define **start** and **end** as Person nodes.

We then proceed a shortest Path between the two. This will give us a path p.

Now, we unwind the path to convert it to a list of nodes.

Finally, let's filter out the Message Nodes. And here we have a list of names from A to B.

## TODO

- [ ] Top messages sans la somme totale, mais par utilisateur différents