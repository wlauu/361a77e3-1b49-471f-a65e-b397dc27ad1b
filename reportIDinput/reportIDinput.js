#!/usr/bin/env node

// Used for asking questions to the user and getting user inputs
const readline = require('readline');

// Define array of objects containing each report type
const reportTypes = [
	{
		id: '1',
		description: 'Diagnostic'
	},
	{
		id: '2',
		description: 'Progress'
	},
	{
		id: '3',
		description: 'Feedback'
	}
];

// Initially define null variables for the matched report types against user input
let selectedReport = null;
let selectedReportUsingDescription = null;

let errorMessage = 'Provided report type is invalid';

function fixDescription(string) {
    //Trim whitepsace
    string = string.trim();
    //Return string with capitalised first letter, the rest as lower case
    return string[0].toUpperCase() + string.slice(1).toLowerCase();
};

const reportIDinput = () => {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Report to generate (1 for Diagnostic, 2 for Progress, 3 for Feedback): ', (reportID) => {
            selectedReport = reportTypes.find(report => report.id === reportID.trim());
            rl.close();
            if (typeof selectedReport === 'undefined') {
                //Check if user entered description instead
                reportID = 
                    selectedReportUsingDescription = reportTypes.find(report => report.description === fixDescription(reportID));
                if (typeof selectedReportUsingDescription === 'undefined') {
                    reject(errorMessage);
                } else {
                    reportID = selectedReportUsingDescription.id;
                    resolve(reportID);
                }
            } else {
                resolve(reportID);
            }
        });
    });
};

module.exports = {
    reportIDinput,
    _private: {
        errorMessage
    }
};