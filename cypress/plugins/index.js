const seedDb = require("../../prisma/seed.js")

module.exports = on => {
  on("task", {
    resetDb: async () => {
      await seedDb()
      return true
    },
  })
}
