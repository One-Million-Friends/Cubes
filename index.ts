import { BunRuntime } from '@effect/platform-bun'
import chalk from 'chalk'
import { ConfigProvider, Effect, pipe, Schedule } from 'effect'
import { constVoid } from 'effect/Function'
import { fmt, fmtProbability } from './game/fmt.ts'
import { Telegram } from './telegram/client.ts'
import { login, collect, buy, statistics } from './game/api.ts'

type State = {
	token: string
	drops: number
	boxes: number
	energy: number
	probability: number
}

const miner = Effect.gen(function* (_) {
	const client = yield* _(Telegram)
	const peerId = yield* _(client.getPeerId('cubesonthewater_bot'))

	const webViewResultUrl = yield* _(
		client.requestWebView({
			url: 'https://www.thecubes.xyz/',
			bot: peerId,
			peer: peerId,
		})
	)

	const tgWebAppData = webViewResultUrl.searchParams.get('tgWebAppData')!
	if (!tgWebAppData) {
		return Effect.none
	}

	const state: State = {
		token: '',
		drops: 0,
		boxes: 0,
		energy: 0,
		probability: 0,
	}

	const sync = Effect.gen(function* (_) {
		const { token, drops_amount, boxes_amount, energy } = yield* login(tgWebAppData)
		const { probability } = yield* statistics

		state.token = token
		state.drops = drops_amount
		state.boxes = boxes_amount
		state.energy = energy
		state.probability = probability
	})

	const mine = Effect.gen(function* (_) {
		if (state.energy < 100) {
			if (state.drops < 50 && state.probability < 50) {
				return
			}

			const { drops_amount, energy } = yield* buy(state.token, 1)
			state.drops = drops_amount
			state.energy = energy
		}

		const { energy, drops_amount, boxes_amount } = yield* collect(state.token)
		const energyDiff = energy - state.energy
		const dropsDiff = drops_amount - state.drops
		const boxesDiff = boxes_amount - state.boxes
		state.drops = drops_amount
		state.boxes = boxes_amount
		state.energy = energy

		console.log(
			chalk.bold(new Date().toLocaleTimeString()),
			chalk.bold(fmtProbability(state.probability)),
			'|⚡️'.padEnd(4),
			chalk.bold(`${state.energy}`.padEnd(4)),
			chalk.bold[energyDiff > 0 ? 'green' : 'red'](fmt(energyDiff).padEnd(4)),
			'|💧'.padEnd(4),
			chalk.bold(`${state.drops}`.padEnd(4)),
			chalk.bold[dropsDiff > 0 ? 'green' : 'red'](fmt(dropsDiff).padEnd(4)),
			'|❓'.padEnd(4),
			chalk.bold(`${state.boxes}`.padEnd(4)),
			chalk.bold[boxesDiff > 0 ? 'green' : 'red'](fmt(boxesDiff).padEnd(4))
		)
	})

	yield* sync

	yield* Effect.all(
		[
			Effect.repeat(
				mine,
				Schedule.addDelay(Schedule.forever, () => '10 seconds')
			),
			Effect.repeat(
				sync,
				Schedule.addDelay(Schedule.forever, () => '60 seconds')
			),
		],
		{ concurrency: 'unbounded' }
	)
})

const policy = Schedule.addDelay(Schedule.forever, () => '15 seconds')

const program = Effect.match(miner, {
	onSuccess: constVoid,
	onFailure: (err) => {
		console.error('‼️FAILED:', err._tag)
	},
})

pipe(
	Effect.all([Effect.repeat(program, policy), Effect.sync(() => process.stdout.write('\u001Bc\u001B[3J'))], {
		concurrency: 'unbounded',
	}),
	Effect.provide(Telegram.live),
	Effect.withConfigProvider(ConfigProvider.fromEnv()),
	BunRuntime.runMain
)
