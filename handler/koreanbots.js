
const config = require("../config.json")
const { KoreanbotsClient } = require("koreanbots")
const client = new KoreanbotsClient({
    koreanbotsOptions: {
        token: config.kbtoken,
        updateInterval: 600000
    }
})
module.exports = () => {
    client.on("ready", () => console.log("koreanbots login!"))

    client.login(config.token)
}