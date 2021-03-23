var nfm = require('../src/bin').nfm;
var src = './temp';
nfm.create(src, true);
console.info(nfm.dir(src));
nfm.copy(src, './.temp');
nfm.remove('./.temp');
nfm.remove(src);
process.exit();
//# sourceMappingURL=tests.js.map