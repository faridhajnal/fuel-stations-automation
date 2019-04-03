const fs = require('fs');
const json2xls = require('json2xls');

const worker = require('./worker');

(async function main() {
    const indecesToRetry = [];
    console.time('total execution');
    let turboMf = [];
    for(let i = 1; i <= 16; i++) {
        let result = await worker(i);
        turboMf = turboMf.concat(result);
        console.log('length', result.length);
        if(!result) indecesToRetry.push(i);
    }
    console.timeEnd('total execution');
    console.log('total length', turboMf.length);
    const xls = json2xls(turboMf);
    const date = new Date();
    fs.writeFileSync(`./output/resultados_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}.xlsx`, xls, 'binary');
    console.info('retry following indeces', indecesToRetry.toString());
})();