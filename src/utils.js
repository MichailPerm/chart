const parseData = (data) => {
    data.Data.forEach(dataObj => {
        dataObj.date = new Date(dataObj.time);
        dataObj.open = +dataObj.open;
        dataObj.high = +dataObj.high;
        dataObj.low = +dataObj.low;
        dataObj.close = +dataObj.close;
        dataObj.volume = +(dataObj.volumeto - dataObj.volumefrom);
    });
    return data;
};


export const getData = () => {
    const promiseMSFT = fetch('https://min-api.cryptocompare.com/data/histoday?fsym=BTC&tsym=USD&allData=true&apiKey=4b0dc05e9367cbd57fc280b26c5305e4a1e518e0ea4ba2d0230260f2114425c1')
    .then(res => res.json())
    .then(data => parseData(data))
    return promiseMSFT;
};
