class Data {
    constructor(props) {}

    get(source, callback) {
        fetch(source)
            .then(response => response.json())
            .then(data => {
                /*data["Argentina"].forEach(({ date, confirmed, recovered, deaths }) =>
                    console.log(`${date} active cases: ${confirmed - recovered - deaths}`)
                );*/
                callback(data);
            }).catch(error => {
                console.log(error);
            });
    };
}

export default Data;