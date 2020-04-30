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

let getTotalByDate = data => {
    let dataSet = data[0];
    let totalSet = {};

    Object.keys(dataSet).forEach(item => {
        dataSet[item].forEach(value => {
            let date = value.date;

            if (totalSet[date] === undefined) {
                totalSet[date] = {
                    confirmed: 0, deaths: 0, recovered: 0
                }
            }

            totalSet[date].confirmed += value.confirmed;
            totalSet[date].deaths += value.deaths;
            totalSet[date].recovered += value.recovered;
        })
    });

    return totalSet;
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

let getMinMax = (data, exclusions) => {
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
            if (!exclusions || exclusions.indexOf(item) === -1 ) {
                if (lastElement.confirmed > maxConfirmed) maxConfirmed = lastElement.confirmed;
                if (lastElement.confirmed < minConfirmed) minConfirmed = lastElement.confirmed;
                if (lastElement.deaths > maxDeaths) maxDeaths = lastElement.deaths;
                if (lastElement.deaths < minDeaths) minDeaths = lastElement.deaths;
                if (lastElement.recovered > maxRecovered) maxRecovered = lastElement.recovered;
                if (lastElement.recovered < minRecovered) minRecovered = lastElement.recovered;
            }
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

let getSorted = (data, value, direction) => {
  let dataSet = data[0];
  let sortedData = new Map();
  let keys = Object.keys(dataSet);
  let sortedArr = keys.map(key => {
      let setValue = dataSet[key][dataSet[key].length - 1][value];

      return [key, setValue]
  }).sort(function(a, b) {
      if (direction === 'ascending' || direction === undefined) {
          return a[1] - b[1];
      } else if (direction === 'descending') {
          return b[1] - a[1];
      }
  });
  let sortedDataSet = {};

  sortedArr.forEach(arr => {
      sortedDataSet[arr[0]] = dataSet[arr[0]];
  });

  return sortedDataSet;
};

let getCountryRank = (data, value) => {
    let dataSet = data[0];
    let rankSet = [['date', 'rank', 'country']];
    let keys = Object.keys(dataSet);
    let rearrangedDataSet = {};

    keys.forEach(key => {
        dataSet[key].forEach(item => {
            if (rearrangedDataSet[item.date] === undefined) rearrangedDataSet[item.date] = [];

            rearrangedDataSet[item.date].push([key, item]);
        });
    });

    Object.keys(rearrangedDataSet).forEach(item => {
        rearrangedDataSet[item].sort(function(a, b) {
           return b[1][value] - a[1][value];
        }).forEach((sortedItem, index) => {
            rankSet.push([item, index+1, sortedItem[0]]);
        });
    });

    return rankSet;
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
    getTotal, getTotalByDate, getLatestDate, getTotalByCountry, countriesCentroidsMapping, getMinMax, getSorted, getCountryRank
}
