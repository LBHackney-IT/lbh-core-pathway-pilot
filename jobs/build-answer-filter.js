require("dotenv").config()
const csv = require("csvtojson")
const fs = require("fs")

const run = async () => {
  try {
    console.log("📡 Running job...")

    const rows = await csv().fromFile("./input.csv")

    const output = [
      {
        id: "direct-payments",
        label: "Direct payments",
        answers: rows
          .filter(row => row["Direct Payments"] === "TRUE")
          .reduce((acc, row) => {
            const step = row["Step name"]
            const question = row["Question"]

            if (acc[step]) {
              acc[step].push(question)
            } else {
              acc[step] = [question]
            }

            return acc
          }, {}),
      },
      {
        id: "brokerage",
        label: "Brokerage",
        answers: rows
          .filter(row => row["Brokerage"] === "TRUE")
          .reduce((acc, row) => {
            const step = row["Step name"]
            const question = row["Question"]

            if (acc[step]) {
              acc[step].push(question)
            } else {
              acc[step] = [question]
            }

            return acc
          }, {}),
      },
    ]

    fs.writeFileSync(
      "./config/answerFilters/answerFilters.json",
      JSON.stringify(output, null, 2)
    )

    console.log(`✅ Done`)
  } catch (e) {
    console.log(e)
  }
  process.exit()
}

run()
