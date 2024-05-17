import {Schema} from "@effect/schema";

export const Auth = Schema.Struct({
    token: Schema.String,
    mined_count: Schema.NumberFromString,
    drops_amount: Schema.NumberFromString,
    boxes_amount: Schema.NumberFromString,
    energy: Schema.NumberFromString,
    banned_until_restore: Schema.String,
})

export const Mined = Schema.Struct({
    mined_count: Schema.NumberFromString,
    drops_amount: Schema.NumberFromString,
    boxes_amount: Schema.NumberFromString,
    energy: Schema.NumberFromString,
    banned_until_restore: Schema.String,
})