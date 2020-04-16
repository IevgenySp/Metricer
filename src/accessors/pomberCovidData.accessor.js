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

let getLatestDate = data => {
  let item = data[0]['Spain'];

  return item[item.length - 1].date;
};

export {
    getTotal, getLatestDate, getTotalByCountry
}
