const fs = require('fs');
const json2xls = require('json2xls');

const worker = require('./worker');

(async function main() {
    const indecesToRetry = [];
    console.time('total execution');
    let turboMf = [];
    let averagesByState = [];
    for(let i = 2; i <= 2; i++) {
        const result = await worker(i);
        let premiumCount= 0;
        let regularCount = 0; 
        let dieselCount = 0;
        let premiumAcc = 0;
        let regularAcc = 0; 
        let dieselAcc = 0;
        if(result.length > 0) {
            for(let entry of result) {
                if(entry.SubProducto.includes('Premium')) {
                    premiumCount = premiumCount + 1;
                    premiumAcc = premiumAcc + entry.PrecioVigente;
                }
                else if(entry.SubProducto.includes('Regular')) {
                    regularCount = regularCount + 1;
                    regularAcc = regularAcc + entry.PrecioVigente;
                }
                else if(entry.SubProducto.includes('Diésel')) {
                    dieselCount = dieselCount + 1;
                    dieselAcc = dieselAcc + entry.PrecioVigente;
                }
            }
            averagesByState.push(
                {
                    Estado: result[0].EntidadFederativaId,
                    PromedioRegular: regularAcc / regularCount,
                    PromedioPremium: premiumAcc / premiumCount,
                    PromedioDiesel: dieselAcc / dieselCount
                }
            )
        }

        turboMf = turboMf.concat(result);
        if(!result) indecesToRetry.push(i);
        else {
            console.log('length', result.length);
            console.log(`done with ${i} requests`);
        }
        //console.log('AVERAGES', averagesByState);
    }
    console.timeEnd('total execution');
    console.log('total length', turboMf.length);
    const xls = json2xls(turboMf);
    const xls2 = json2xls(averagesByState);
    const date = new Date();
    fs.writeFileSync(`./output/resultados_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}.xlsx`, xls, 'binary');
    fs.writeFileSync(`./output/promedios_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}.xlsx`, xls2, 'binary');
    if(indecesToRetry.length > 0)     console.info('retry following indeces', indecesToRetry.toString());
    else console.log('no indeces to retry');
})();