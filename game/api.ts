import * as Http from "@effect/platform/HttpClient";
import {Effect} from "effect";
import {Auth, Buy, Mine, Stats} from "./models.ts";

const UA = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";

export const login = (tgWebAppData: string) => Http.request.post("https://server.questioncube.xyz/auth").pipe(
    Http.request.setHeader("Content-Type", "application/json"),
    Http.request.jsonBody({
        initData: tgWebAppData,
    }),
    Effect.andThen(Http.client.fetchOk),
    Effect.andThen(Http.response.schemaBodyJson(Auth)),
    Effect.scoped,
)

export const buy = (accessToken: string, proposalId = 1) => Http.request.post("https://server.questioncube.xyz/game/rest-proposal/buy").pipe(
    Http.request.setHeader("User-Agent", UA),
    Http.request.setHeader("Content-Type", "application/json"),
    Http.request.jsonBody({
        "token": accessToken,
        "proposal_id": proposalId
    }),
    Effect.andThen(Http.client.fetch),
    Effect.andThen(Http.response.schemaBodyJson(Buy)),
    Effect.scoped,
)

export const collect = (accessToken: string) => Http.request.post("https://server.questioncube.xyz/game/mined").pipe(
    Http.request.setHeader("User-Agent", UA),
    Http.request.setHeader("Content-Type", "application/json"),
    Http.request.jsonBody({
        "token": accessToken
    }),
    Effect.andThen(Http.client.fetch),
    Effect.andThen(Http.response.schemaBodyJson(Mine)),
    Effect.scoped,
)

export const statistics = Http.request.get("https://server.questioncube.xyz/chart").pipe(
    Http.client.fetchOk,
    Effect.andThen(Http.response.schemaBodyJson(Stats)),
    Effect.scoped,
)
