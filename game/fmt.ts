import chalk from "chalk";

export const fmt = new Intl.NumberFormat("ru-RU", {
    notation: "standard",
    signDisplay: "always",
    compactDisplay: "long",
    maximumFractionDigits: 0
}).format;

// .2, .4, .6, .8, 1
export const fmtProbability = (probability: number) => {
    const size = 5
    let bar = new Array(size).fill("❱").join("")

    return (
        probability <= 20 ? chalk.grey :
            probability <= 40 ? chalk.red :
                probability <= 60 ? chalk.yellow :
                    probability <= 80 ? chalk.green :
                        chalk.magenta
    )(bar.slice(0, Math.ceil(probability / 20)).padEnd(size))
}
