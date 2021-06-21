const Discord = require("discord.js")
const fs = require("fs")
const config = require("../config.json")

module.exports = (client, DokdoHandler) => {

    fs.readdirSync("./commands/").forEach((dir) => {
        const commands = fs.readdirSync(`./commands/${dir}/`).filter((file) => file.endsWith(".js"))
        if (commands.length <= 0) return console.log("명령어를 찾을 수 없어요!")
        for (let file of commands) {
            let cmds = require(`../commands/${dir}/${file}`)
            if (cmds.name) {
                client.commands.set(cmds.name, cmds)
                console.log(`[commands] ${cmds.name} Loaded`)
            }
            if (cmds.aliases && Array.isArray(cmds.aliases)) cmds.aliases.forEach((alias) => client.aliases.set(alias, cmds.name))
        }
    })

    client.on("ready", () => {
        console.log(`[client] ${client.user.username} ready!`)
        setInterval(() => {
            const server = client.guilds.cache.size
            const cstatuslist = [
                `${config.prefix}도움`,
                `${config.prefix}초대`,
                `${server} 서버`
            ]
            const index = Math.floor(Math.random() * cstatuslist.length)
            client.user.setActivity(cstatuslist[index] + " | 보이스채널", { type: "COMPETING" })
        }, 10000)
    })

    // Debug | client.on("debug", (e) => logger.log(e))
    client.on("warn", (info) => console.warn(info))
    client.on("error", (error) => console.error(error))

    client.on("message", async message => {
        if (!message.guild || message.author.bot || message.channel.type === "dm") return
        const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&")
        const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(config.prefix)})\\s*`, "u")
        if (!prefixRegex.test(message.content)) return

        const [, matchedPrefix] = message.content.match(prefixRegex)

        const args = message.content.slice(matchedPrefix.length).trim().split(/ +/u)
        const commandName = args.shift().toLowerCase()

        DokdoHandler.run(message)

        const command =
            client.commands.get(commandName) ||
            client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName))

        if (!command) return

        if (!client.cooldowns.has(command.name)) {
            client.cooldowns.set(command.name, new Discord.Collection())
        }

        const now = Date.now()
        const timestamps = client.cooldowns.get(command.name)
        const cooldownAmount = (command.cooldown || 1) * 1000

        if (timestamps.has(message.author.id)) {
            const expirationTime = timestamps.get(message.author.id) + cooldownAmount

            if (now < expirationTime) {
                const timeLeft = (expirationTime - now) / 1000
                return message.reply(
                    `\`${command.name}\` 명령어는 ${timeLeft.toFixed(1)}초 뒤에 다시 사용하실수 있어요! :pensive:`
                )
            }
        }

        timestamps.set(message.author.id, now)
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount)

        try {
            command.run(client, message, args, config)
        } catch (error) {
            console.error(error)
            message.reply(`에러가 발생했습니다.\n${error}`).catch(console.error)
        }
    })

    client.login(config.token)

}