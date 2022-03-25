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

let errorMessage = 'Provided report type is invalid';

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
                reject(errorMessage);
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