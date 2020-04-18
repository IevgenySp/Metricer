let getTotal = data => {
  let dataSet = data[0];
  let totalCases = 0;
  let deathCases = 0;
  let recoverCases = 0;

  Object.keys(dataSet).forEach(item => {
     let lastElement = dataSet[item][dataSet[item].length - 1];

      totalCases += lastElement.confirmed;
      deathCases += lastElement.deaths;
      recoverCases += lastElement.recovered;
  });

  return {totalCases, deathCases, recoverCases};
};

let getTotalByCountry = data => {
    let dataSet = data[0];
    let result = new Map();

    Object.keys(dataSet).forEach(item => {
        let lastElement = dataSet[item][dataSet[item].length - 1];

        result.set(item, {
            date: lastElement.date,
            confirmed: lastElement.confirmed,
            deaths: lastElement.deaths,
            recovered: lastElement.recovered})
    });

    return result;
};

let getMinMax = data => {
    let dataSet = data[0];
    let minConfirmed;
    let maxConfirmed;
    let minDeaths;
    let maxDeaths;
    let minRecovered;
    let maxRecovered;

    Object.keys(dataSet).forEach((item, index) => {
        let lastElement = dataSet[item][dataSet[item].length - 1];

        if (index === 0) {
            minConfirmed = maxConfirmed = lastElement.confirmed;
            minDeaths = maxDeaths = lastElement.deaths;
            minRecovered = maxRecovered = lastElement.recovered;
        } else {
            if (lastElement.confirmed > maxConfirmed) maxConfirmed = lastElement.confirmed;
            if (lastElement.confirmed < minConfirmed) minConfirmed = lastElement.confirmed;
            if (lastElement.deaths > maxDeaths) maxDeaths = lastElement.deaths;
            if (lastElement.deaths < minDeaths) minDeaths = lastElement.deaths;
            if (lastElement.recovered > maxRecovered) maxRecovered = lastElement.recovered;
            if (lastElement.recovered < minRecovered) minRecovered = lastElement.recovered;
        }
    });

    return {
        confirmed: {
            min: minConfirmed,
            max: maxConfirmed
        },
        death: {
            min: minDeaths,
            max: maxDeaths
        },
        recovered: {
            min: minRecovered,
            max: maxRecovered
        }
    }
};

let getLatestDate = data => {
  let item = data[0]['Spain'];

  return item[item.length - 1].date;
};

let countriesCentroidsMapping = () => {
    let centroids = [
        'United States',
        'Czech Republic',
        'South Korea',
        'Taiwan',
        'Macedonia [FYROM]',
        'Congo [DRC]',
        'Congo [Republic]',
        'Côte d\'\'Ivoire',
        'Cape Verde',
        'Swaziland',
        'Gaza Strip',
        'Myanmar [Burma]',
        'São Tomé and Príncipe'];
    let data = [
        'US',
        'Czechia',
        'Korea, South',
        'Taiwan*',
        'North Macedonia',
        'Congo (Kinshasa)',
        'Congo (Brazzaville)',
        'Cote d\'Ivoire',
        'Cabo Verde',
        'Eswatini',
        'West Bank and Gaza',
        'Burma',
        'Sao Tome and Principe'];
    let mappedData = new Map();

    centroids.forEach((item, index) => {
       mappedData.set(item, data[index])
    });

    return mappedData;
};

export {
    getTotal, getLatestDate, getTotalByCountry, countriesCentroidsMapping, getMinMax
}
