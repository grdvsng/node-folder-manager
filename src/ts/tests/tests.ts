

const nfm         = require('../src/bin').nfm;
const src: string = './temp';

nfm.create(src, true);
console.info(nfm.dir(src));
nfm.copy(src, './.temp')
nfm.remove('./.temp');
nfm.remove(src);

process.exit();