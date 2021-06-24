const { Util, MessageEmbed } = require("discord.js")
const DisTube = require("distube").default
const SpotifyPlugin = require("@distube/spotify")
const SoundCloudPlugin = require("@distube/soundcloud")
const config = require("../config.json")

module.exports = (client) => {
    client.distube = new DisTube(client, {
        emitNewSongOnly: true,
        searchSongs: 10,
        leaveOnEmpty: true,
        customFilters: config.filters,
        YoutubeCookie: config.ytcookie,
        plugins: [
            new SpotifyPlugin(),
            new SoundCloudPlugin()
        ],
        ytdlOptions: { highWaterMark: 1<<25 }
    })

    const status = (queue) => `음량: \`${queue.volume}%\` | 필터: \`${queue.filter || "꺼짐"}\` | 반복: \`${queue.repeatMode ? queue.repeatMode === 2 ? "전체 반복" : "한 곡만" : "꺼짐"}\` | 자동재생: \`${queue.autoplay ? "켜짐" : "꺼짐"}\``

    client.distube
        .on("initQueue", queue => {
            queue.autoplay = false
        })
        .on("playSong", (queue, song) => {
            queue.textChannel.stopTyping(true)
            const embed = new MessageEmbed()
                .setTitle(":white_check_mark: 재생중")
                .setColor("cbd0ed")
                .addField("노래", `[\`${Util.escapeMarkdown(song.name)}\` - \`${song.formattedDuration}\`](${song.url})`)
                .addField("신청자", `${song.user}`)
                .addField("상태", `${status(queue)}`)
                .setTimestamp()
            if (!song.thumbnail === null) {
                embed.setThumbnail(`${song.thumbnail}`)
            }
            queue.textChannel.send({ embeds: [embed]})

            if (queue.voiceChannel.type === "stage" && queue.voiceChannel.manageable) {
                queue.clientMember.voice.setSuppressed(false)
            }
            if (queue.voiceChannel.type === "stage" && !queue.voiceChannel.manageable && queue.clientMember.voice.suppress) {
                const embed = new MessageEmbed()
                    .setTitle(":grey_exclamation: 잠시만요!")
                    .setColor("cbd0ed")
                    .setDescription("저에게 스테이지 관리 권한을 부여해 주시거나 발언권 요청을 받아주세요.")
                    .setImage("https://nyan.shx.gg/a0QDsc.gif")
                    .setTimestamp()
                queue.textChannel.send({ embeds: [embed]})
                queue.clientMember.voice.setRequestToSpeak(true)
            }
        })
        .on("addSong", (queue, song) => {
            queue.textChannel.stopTyping(true)
            const embed = new MessageEmbed()
                .setTitle(":white_check_mark: 추가 완료")
                .setColor("cbd0ed")
                .addField("노래", `[\`${Util.escapeMarkdown(song.name)}\` - \`${song.formattedDuration}\`](${song.url})`)
                .addField("신청자", `${song.user}`, true)
                .setTimestamp()
            if (!song.thumbnail === null) {
                embed.setThumbnail(`${song.thumbnail}`)
            }
            queue.textChannel.send(embed)
        })
        .on("addList", (queue, playlist) => {
            queue.textChannel.stopTyping(true)
            const embed = new MessageEmbed()
                .setTitle(":white_check_mark: 추가 완료")
                .setColor("cbd0ed")
                .addField("플레이리스트", `\`${Util.escapeMarkdown(playlist.name)}\``)
                .addField("노래", `${playlist.songs.length}개의 노래를 넣었어요.`)
                .addField("상태", `${status(queue)}`)
                .setTimestamp()
            queue.textChannel.send({ embeds: [embed]})
        })
        .on("searchResult", (message, result) => {
            let i = 0
            message.channel.send("**아무거나 치시거나 60초뒤면 취소 됩니다.**\n"
            +   "알맞는 숫자를 입력해 주세요!")
            const resultname = result.map(song => `${++i}. ${song.name} - ${song.formattedDuration}`)
                .slice(0, 1990).join("\n")
            message.channel.send(`\n\n${resultname}`, {code: "markdown"})
        })
        .on("searchCancel", message => {
            message.channel.stopTyping(true)
            message.channel.send("취소됐어요! :pensive:")
        })
        .on("error", (channel, e) => {
            channel.stopTyping(true)
            channel.send("에러가 발생 하였습니다!\n")
            channel.send(`${e}`, {code: "log"})
            console.warn(e)
        })
        .on("searchNoResult", message => message.channel.send("404 video not found"))
        .on("noRelated", queue => queue.textChannel.send("삐빅.. 추천 영상을 찾을 수 없습니다.."))
        .on("finish", queue => {
            const embed = new MessageEmbed()
                .setTitle("노래가 끝났어요!")
                .setColor("cbd0ed")
                .setDescription(`더이상 듣기를 원치 않는다면 \`${config.prefix}나가\` 명령어를 입력해 주세요.`)
            queue.textChannel.send({ embeds: [embed]})
        })
        .on("disconnect", queue => {
            const embed = new MessageEmbed()
                .setTitle("보이스채널에서 끊겼어요!")
                .setColor("cbd0ed")
                .setDescription(`\`${config.prefix}재생\` 명령어로 다시 재생해 주세요.`)
            queue.textChannel.send({ embeds: [embed]})
        })
}
