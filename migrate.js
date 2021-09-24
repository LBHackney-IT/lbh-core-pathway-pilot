const {promisify} = require('util');
const exec = promisify(require('child_process').exec);

module.exports.handler = async () => {
    const output = await exec('node_modules/.bin/prisma db push --skip-generate');

    console.log(output.stdout);

    return true;
};
