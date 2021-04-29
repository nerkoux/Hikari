const { MessageEmbed } = require("discord.js")
const DisTube = require("distube")
const SpotifyPlugin = require("@distube/spotify")
const config = require("../config.json")

module.exports = (client) => {
    client.distube = new DisTube(client, {
        searchSongs: 10,
        leaveOnEmpty: true,
        customFilters: config.filters,
        YoutubeCookie: config.ytcookie,
        plugins: [new SpotifyPlugin()]
    })

    const status = (queue) => `음량: \`${queue.volume}%\` | 필터: \`${queue.filter || "꺼짐"}\` | 반복: \`${queue.repeatMode ? queue.repeatMode === 2 ? "전체 반복" : "한 곡만" : "꺼짐"}\` | 자동재생: \`${queue.autoplay ? "켜짐" : "꺼짐"}\``

    client.distube
        .on("playSong", (queue, song) => {
            const embed = new MessageEmbed()
                .setTitle(":white_check_mark: 재생중")
                .setColor("000000")
                .addField("노래", `[\`${song.name}\` - \`${song.formattedDuration}\`](${song.url})`)
                .addField("신청자", `${song.user}`)
                .addField("상태", `${status(queue)}`)
                .setTimestamp()
            if (!song.thumbnail === null) {
                embed.setThumbnail(`${song.thumbnail}`)
            }
            queue.textChannel.send(embed)
            queue.connection.voice.setSelfDeaf(true)
        })
        .on("addSong", (queue, song) => {
            const embed = new MessageEmbed()
                .setTitle(":white_check_mark: 추가 완료")
                .setColor("000000")
                .addField("노래", `[\`${song.name}\` - \`${song.formattedDuration}\`](${song.url})`)
                .addField("신청자", `${song.user}`, true)
                .setTimestamp()
            if (!song.thumbnail === null) {
                embed.setThumbnail(`${song.thumbnail}`)
            }
            queue.textChannel.send(embed)
        })
        .on("addList", (queue, playlist) => {
            const embed = new MessageEmbed()
                .setTitle(":white_check_mark: 추가 완료")
                .setColor("RANDOM")
                .addField("플레이리스트", `\`${playlist.name}\``)
                .addField("노래", `${playlist.songs.length}개의 노래를 넣었어요.`)
                .addField("상태", `${status(queue)}`)
                .setTimestamp()
            queue.textChannel.send(embed)
        })
        .on("searchResult", (message, result) => {
            let i = 0
            const resultname = result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")
            const embed = new MessageEmbed()
                .setTitle("검색")
                .setColor("000000")
                .setDescription(`**아무거나 치시거나 60초뒤면 취소 됩니다.**\n 숫자를 입력해주세요!\n\n${resultname}`)
                .setTimestamp()
            message.channel.send(embed)
        })
        .on("searchCancel", message => message.channel.send("취소됐어요!"))
        .on("error", (channel, e) => {
            channel.send(`에러가 발생하였습니다!\n\`\`\`\n${e}\n\`\`\``)
            console.error(e)
        })
        .on("searchNoResult", message => message.channel.send("404 video not found"))
        .on("finish", queue => {
            const embed = new MessageEmbed()
                .setTitle("노래가 끝났어요!")
                .setColor("000000")
                .setDescription(`더이상 듣기를 원치 않는다면 \`${config.prefix}나가\` 명령어를 입력해주세요.`)
            queue.textChannel.send(embed)
        })
}