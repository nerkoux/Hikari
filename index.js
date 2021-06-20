const Discord = require("discord.js")
const client = new Discord.Client({
    disableEveryone: true,
    intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_VOICE_STATES", "GUILD_MESSAGE_REACTIONS", "GUILD_MESSAGE_TYPING"]
})
const fs = require("fs")
const Dokdo = require("dokdo")
const config = require("./config.json")

client.commands = new Discord.Collection()
client.aliases = new Discord.Collection()
client.categories = fs.readdirSync("./commands/")
client.cooldowns = new Discord.Collection()
client.prefix = require("./config.json")
const DokdoHandler = new Dokdo(client, { aliases: ["eval", "dok"], prefix: config.prefix })

const eventFiles = fs.readdirSync("./events").filter(file => file.endsWith(".js"))
for (const file of eventFiles) {
    if (file === "koreanbots.js") return console.log(`${file} Not Loaded`)
    require(`./events/${file}`)(client, DokdoHandler)
    console.log(`${file} Loaded`)
}