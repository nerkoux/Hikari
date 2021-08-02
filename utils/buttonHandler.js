module.exports = async (client, interaction) => {
    const id = interaction.customId
    const queue = client.distube.getQueue(interaction.message)
    if (interaction.user !== queue.songs[0].user) return
    if (id === "stop") {
        return client.distube.stop(interaction.message)
    }
}