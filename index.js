#!/usr/bin/env node

/**
 * acerCodingChallenge
 * Generate an assessment report for a given student ID and report type.
 *
 * @author Wen Lau <https://github.com/wlauu/361a77e3-1b49-471f-a65e-b397dc27ad1b>
 */

const init = require('./utils/init');
const cli = require('./utils/cli');
const log = require('./utils/log');

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

/* Used for asking questions to the user and getting user inputs */
const readline = require('readline').createInterface({
	input: process.stdin,
	output: process.stdout
});
/* Used to query data from JSON files to be parsed */
const fs = require('fs');

/* Define array of objects containing each report type */
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

/* Get data from each JSON file and set to variables for later use */
const assessmentData = fs.readFileSync('./data/assessments.json');
const assessments = JSON.parse(assessmentData);

const questionData = fs.readFileSync('./data/questions.json');
const questions = JSON.parse(questionData);

const studentData = fs.readFileSync('./data/students.json');
const students = JSON.parse(studentData);

const studentResponseData = fs.readFileSync('./data/student-responses.json');
const studentResponses = JSON.parse(studentResponseData);

/* Initially define null variables for the matched students and report types against user inputs */
let selectedStudent = null;
let selectedReport = null;

(async () => {
	init({ clear });
	input.includes(`help`) && cli.showHelp(0);
	debug && log(flags);

	/* Starting the app - pass in "start" parameter */
	if (input.includes('start')) {
		/* Ask user for student ID */
		readline.question('Please enter the following \nStudent ID: ', (studentID) => {
			selectedStudent = students.find(student => student.id === studentID);
			if (typeof selectedStudent !== 'undefined') {
				/* After finding matching student, set variable for student full name and ask user for report type */
				let selectedStudentFullName = selectedStudent.firstName + ' ' + selectedStudent.lastName;
				readline.question('Report to generate (1 for Diagnostic, 2 for Progress, 3 for Feedback): ', (reportID) => {
					selectedReport = reportTypes.find(report => report.id === reportID);
					if (typeof selectedReport !== 'undefined') {
						/* After finding matching report type, set variable for report type description */
						let selectedReportDescription = selectedReport.description;
						console.log('Generating ' + selectedReportDescription + ' report for ' + selectedStudentFullName + '.');
					} else {
						/* User input report type could not be found */
						console.log('The report type selected to generate does not exist.');
					}
				});
			} else {
				/* User input student ID could not be found */
				console.log('The student ID entered does not exist.');
			};
		});
	};
})();

