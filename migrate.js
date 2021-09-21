const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

module.exports.handler = async () => {
    throw new Error();
    // const output = await exec('node_modules/.bin/prisma db push --skip-generate');
    //
    // if (output.stderr.length > 0) console.error(output.stderr);
    //
    // return output.stdout;
};
