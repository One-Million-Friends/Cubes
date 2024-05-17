const auth = () => fetch("https://server.questioncube.xyz/auth", {
    "body": "{\"initData\":\"query_id=AAH5gpYNAAAAAPmClg3VyUET&user=%7B%22id%22%3A227967737%2C%22first_name%22%3A%22polRk%22%2C%22last_name%22%3A%22%22%2C%22username%22%3A%22polrk%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%7D&auth_date=1715263812&hash=ccdf21a0a346a6112f0b67504c396c68f539673f7522509b14b858a72afa5d5d\"}",
    "headers": {
        "Accept": "*/*",
        "Accept-Language": "ru",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
    },
    "method": "POST",
    "mode": "cors",
})
    .then(r => r.json() as Promise<{
        mined_count: string,
        drops_amount: string,
        boxes_amount: string,
        energy: string,
        banned_until_restore: boolean,
        token: string
    }>)

const mine = () => fetch("https://server.questioncube.xyz/game/mined", {
    "method": "POST",
    "headers": {
        "Accept": "*/*",
        "Accept-Language": "ru",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
    },
    "body": JSON.stringify({
        "token": token
    }),
})
    .then(r => r.json() as Promise<{
        mined_count: string,
        drops_amount: string,
        boxes_amount: string,
        energy: string,
        banned_until_restore: boolean
    }>)

const authR = await auth()
let {token, energy, banned_until_restore} = authR
console.log(authR)

if (banned_until_restore) {
    console.log("RESTORING ENERGY...")
    await Bun.sleep((1000 - parseInt(energy, 10)) * 1000)
}

while (true) {
    try {
        const r = await mine()
        console.log(r)

        console.log("MINED: ", r.mined_count)
        console.log("DROPS: ", r.drops_amount)
        console.log("BOXES: ", r.boxes_amount)

        if (r.banned_until_restore) {
            console.log("RESTORING ENERGY...")
            await Bun.sleep(16 * 60 * 1000)
        }
    } catch (e) {
        console.error("GOT AN ERROR: ", e)

        const state = await auth()
        token = state.token
        if (state.banned_until_restore) {
            console.log("RESTORING ENERGY...")
            await Bun.sleep(16 * 60 * 1000)
        }
    } finally {
        console.log("SLEEP...")

        await Bun.sleep(3*1000)
    }
}