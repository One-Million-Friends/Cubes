import {BunRuntime} from "@effect/platform-bun";
import chalk from "chalk";
import {ConfigProvider, Effect, pipe, Schedule} from "effect";
import {constVoid} from "effect/Function"
import {fmt} from "./game/fmt.ts";
import {Telegram} from "./telegram/client.ts";
import {login, collect} from "./game/api.ts";

const miner = Effect.gen(function* (_) {
    const client = yield* _(Telegram);
    const peerId = yield* _(client.getPeerId('cubesonthewater_bot'));

    const webViewResultUrl = yield* _(client.requestWebView({
        url: 'https://www.thecubes.xyz/',
        bot: peerId,
        peer: peerId
    }));

    const tgWebAppData = webViewResultUrl.searchParams.get('tgWebAppData')!
    if (!tgWebAppData) {
        return Effect.none
    }

    let {token, ...state} = yield* login(tgWebAppData)

    const sync = Effect.gen(function* (_) {
        const {token: newToken, ...newState} = yield* login(tgWebAppData)
        token = newToken
        state = newState
    })

    const mine = Effect.gen(function* (_) {
        if (state.banned_until_restore !== "false") {
            return
        }

        const result = yield* collect(token)

        console.log(
            chalk.bold(new Date().toLocaleTimeString()),
            chalk.bold.blue(result.energy, "⚡️"),
            chalk.bold.green(fmt(result.drops_amount - state.drops_amount)), "💧",
            chalk.bold.green(fmt(result.boxes_amount - state.boxes_amount)), "❓"
        )

        state = result
    })

    yield* Effect.all([
        Effect.repeat(mine, Schedule.addDelay(Schedule.forever, () => "5 seconds")),
        Effect.repeat(sync, Schedule.addDelay(Schedule.forever, () => "60 seconds")),
    ], {concurrency: "unbounded"})
})

const policy = Schedule.addDelay(Schedule.forever, () => "15 seconds")

const program = Effect.match(miner, {
    onSuccess: constVoid,
    onFailure: (err) => {
        console.error("‼️FAILED:", err._tag)
    },
})

pipe(
    Effect.repeat(program, policy),
    Effect.provide(Telegram.live),
    Effect.withConfigProvider(ConfigProvider.fromEnv()),
    BunRuntime.runMain
)