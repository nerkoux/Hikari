const { MessageEmbed } = require("discord.js")

module.exports = {
    name: "재생",
    aliases: ["틀어", "노래"],
    description: "노래를 틀어줘요",
    cooldown: "5",
    run: async (client, message, args) => {
        const nostring = new MessageEmbed()
            .setTitle("Hikari :heart:")
            .setColor("RANDOM")
            .addField(`${client.prefix.prefix}재생 <URL>`, "[수많은 사이트들을 지원해요!](https://ytdl-org.github.io/youtube-dl/supportedsites.html)\n**Spotify도 가능해요!**")
        const string = args.join(" ")
        if (!string) return message.channel.send(nostring)
        try {
            message.channel.send(":woozy_face: 로딩중..")
            client.distube.play(message, string)
        } catch (e) {
            message.channel.send(`에러가 발생하였습니다!\n\`\`\`\n${e}\n\`\`\``)
        }
    }
}