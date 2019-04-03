const axios = require('axios');
const axiosRetry = require('axios-retry');
const entidades = require('./equivalences/entidades');

axiosRetry(axios, { retries: 3 });

const prependNumber = (number) => {
    if(number < 10) {
        return "00" + number;
    }
    if(number < 100) {
        return "0" + number;
    }
    return "" + number;
}

const prepareRequest = (entidadId, municipioId) => {
    const params = {
        entidadId,
        municipioId
    }
    return new Promise((resolve, reject) => {
        axios.get('http://api-reportediario.cre.gob.mx/api/EstacionServicio/Petroliferos', { params })
        .then(response => resolve({response, params}))
        .catch(error => reject(error));
    });
}

module.exports = async function process(entidadId) {
    try {
        //entidadId 7 = CHIAPAS
        const entidadName = entidades[prependNumber(entidadId)].toLowerCase();
        let promisesArray = [];
        const entidad = require(`./equivalences/${entidadName}`);
        console.time('allRequestsResolved');
        const municipiosIds = Object.keys(entidad).map(m => parseInt(m));
        const upperLimit = municipiosIds.reduce((a, b) => Math.max(a, b));
        for(let i = 1; i <= upperLimit; i++) {
            promisesArray.push(prepareRequest(prependNumber(entidadId), prependNumber(i)));
        }
        const results = await Promise.all(promisesArray);
        console.timeEnd('allRequestsResolved');
        let allMunicipiosResults = [];
        let noStations = [];
        console.time('parseResults');
        for(let result of results) {
            if(result.response.data.length === 0) {
                noStations.push(result.params.municipioId);
            }

            else {
                for(let record of result.response.data) {
                    allMunicipiosResults.push({
                        ...record,
                        EntidadFederativaId: entidades[result.params.entidadId],
                        MunicipioId: entidad[result.params.municipioId]
                    });
                }
            }
        }

        console.timeEnd('parseResults');
        console.log(`no stations found for following municipios on entity ${entidadName}: ${noStations.toString()}`)
        return allMunicipiosResults;
        // const xls = json2xls(allMunicipiosResults);
        // const date = new Date();
        // fs.writeFileSync(`./output/${entidadName}_${date.getFullYear()}_${date.getMonth() + 1}_${date.getDate()}.xlsx`, xls, 'binary');
        // return true;
    }

    catch(error) {
        console.error(error);
        return false;
    }
    

};
