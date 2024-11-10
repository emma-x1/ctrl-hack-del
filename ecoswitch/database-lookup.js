const fs = require('fs');
const csv = require('csv-parser');
const results = [];
const desiredColumns = ['Company Name', 'Total Environmental Intensity (Revenue)'];

fs.createReadStream('final_raw_sample_0_percent.csv')
    .pipe(csv())
    .on('data', (data) => {
        const filteredData = {};
        desiredColumns.forEach((col) => {
            if (data[col] !== undefined) {
                filteredData[col] = data[col];
            }
        });
        results.push(filteredData);
    })
    .on('end', () => {
        console.log(JSON.stringify(results.slice(0, 5), null, 2));
    });

function getEnvInfo(companyName) {
    const regex = new RegExp(companyName, 'i');
    const companyData = results.find(row => regex.test(row['Company Name']));

    if (companyData) {
        return comapnyData['Total Environmental Intensity (Revenue)'];}
        else {
            return 'Company not found';
        }
    }
    console.log(getEnvInfo('CHINA PACIFIC INSURANCE (GROUP) COMPANY LIMITED'));
