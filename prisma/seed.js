const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

const main = async () => {
  // await prisma.workflow.deleteMany({})
  // await prisma.workflow.createMany({
  //   data: [
  //     {
  //       id: 1,
  //     },
  //     {
  //       id: 2,
  //     },
  //   ],
  // })
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

module.exports = main
