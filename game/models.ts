import { Schema } from '@effect/schema'

export const Auth = Schema.Struct({
	token: Schema.String,
	mined_count: Schema.NumberFromString,
	drops_amount: Schema.NumberFromString,
	boxes_amount: Schema.NumberFromString,
	energy: Schema.NumberFromString,
	banned_until_restore: Schema.String,
})

export const Mine = Schema.Struct({
	mined_count: Schema.NumberFromString,
	drops_amount: Schema.NumberFromString,
	boxes_amount: Schema.NumberFromString,
	energy: Schema.NumberFromString,
	banned_until_restore: Schema.String,
})

export const Buy = Schema.Struct({
	drops_amount: Schema.NumberFromString,
	energy: Schema.NumberFromString,
})

export const Stats = Schema.Struct({
	probability: Schema.Number,
	maxUsers: Schema.Number,
	activeUsers: Schema.Number,
	activeUsers10min: Schema.Number,
	minedCount: Schema.Number,
	boxesAmount: Schema.Number,
	totalUsers: Schema.Number,
})
