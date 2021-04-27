const Discord = require("discord.js")
const client = new Discord.Client({ disableEveryone: true })
const fs = require("fs")
const Dokdo = require("dokdo")
const config = require("./config.json")

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
client.categories = fs.readdirSync("./commands/")
client.cooldowns = new Discord.Collection()
client.prefix = require("./config.json")
const DokdoHandler = new Dokdo(client, { aliases: ["eval", "dok"], prefix: config.prefix });

[ /* idk why not working "koreanbots",*/ "commands", "distube"].forEach(handler => {
    require(`./handler/${handler}`)(client, DokdoHandler)
})