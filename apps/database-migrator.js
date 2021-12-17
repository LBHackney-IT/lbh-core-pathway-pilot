const { promisify } = require("util")
const exec = promisify(require("child_process").exec)

module.exports.handler = async () => {
  const output = await exec("node_modules/.bin/prisma migrate deploy")

  console.log(output.stdout)

  if (output.stderr) console.error(output.stderr)

  return true;
};
