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

/* Used to parse dates and get date ordinals */
const dateTime = require('date-and-time');
const dateTimeOrdinal = require('date-and-time/plugin/ordinal');
dateTime.plugin(dateTimeOrdinal);

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
/* Used to get most recent completed assessment */
const studentResponsesCopy = studentResponses.slice();
const studentResponsesCompletedDateSortedDesc = studentResponsesCopy.sort(function (a, b) {
	return b.completed.localeCompare(a.completed);
});

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
						/* Get the most recent assessment (used in reports 1 and 3) */
						let selectedAssessmentMostRecent = studentResponsesCompletedDateSortedDesc.find(
							studentResponse =>
								studentResponse.student.id === studentID
								&& typeof studentResponse.completed !== 'undefined'
						);
						/* Get assessment name */
						let selectedAssessmentMostRecentAssessment = assessments.find(assessment => assessment.id === selectedAssessmentMostRecent.assessmentId);
						let selectedAssessmentMostRecentAssessmentName = selectedAssessmentMostRecentAssessment.name;
						/* Convert assessment completion date into date format */
						let selectedAssessmentMostRecentAssessmentDate = dateTime.parse(selectedAssessmentMostRecent.completed, 'DD/MM/YYYY HH:mm:ss');
						let selectedAssessmentMostRecentAssessmentFormattedDate = dateTime.format(selectedAssessmentMostRecentAssessmentDate, 'DDD MMMM YYYY hh:mm A');
						/* Get student raw score */
						let selectedAssessmentMostRecentRawScore = selectedAssessmentMostRecent.results.rawScore;
						/* Get total question number of assessment */
						let selectedAssessmentMostRecentTotalQuestions = selectedAssessmentMostRecent.responses.length;

						if (selectedReportDescription === 'Diagnostic') {
							console.log(selectedStudentFullName + ' recently completed ' + selectedAssessmentMostRecentAssessmentName + ' assessment on '
								+ selectedAssessmentMostRecentAssessmentFormattedDate + '\n'
								+ 'He got ' + selectedAssessmentMostRecentRawScore + ' questions right out of ' + selectedAssessmentMostRecentTotalQuestions + '.'
								+ 'Details by strand given below: \n' + ''
							);
						} else
						if (selectedReportDescription === 'Progress') {
							/* Get only the assessments that match the student */
							let studentAssessments = studentResponses.filter(
								studentResponse =>
									studentResponse.student.id === studentID
									&& typeof studentResponse.completed !== 'undefined'
							);
							/* Get count for each type of assessment the student took, as well as other variables to be used in the output */
							let studentAssessmentRecords = [];
							studentAssessments.forEach((studentAssessment) => {
								let matchedAssessmentIndex = studentAssessmentRecords.findIndex(assessmentType => assessmentType.assessmentId === studentAssessment.assessmentId);
								/* If the assessment type has already been counted before, then add to the existing count */
								if (matchedAssessmentIndex !== -1) {
									++studentAssessmentRecords[matchedAssessmentIndex].count;
								}
								else {
									/* If the assessment type has not been counted before, add a new count for the assessment type as well as variables to be used for output */
									studentAssessmentRecords.push({
										'assessmentId': studentAssessment.assessmentId,
										'assessmentType': assessments.find(assessment => assessment.id === studentAssessment.assessmentId).name,
										'count': 1,
										'output': null,
										'oldestScore': null,
										'newestScore': null,
										'totalQuestions': studentAssessment.responses.length,
										'indivAssessments': []
									});
									matchedAssessmentIndex = studentAssessmentRecords.findIndex(assessmentType => assessmentType.assessmentId === studentAssessment.assessmentId);
								}
								/* Store the completed date and raw score for each assessment to be used in the output */
								studentAssessmentRecords[matchedAssessmentIndex].indivAssessments.push({
									'completed': studentAssessment.completed,
									'rawScore': studentAssessment.results.rawScore
								});
							});

							/* Setup output for each type of assessment */
							studentAssessmentRecords.forEach((studentAssessmentRecord) => {
								studentAssessmentRecord.output = '\n' + selectedStudentFullName + ' has completed ' + studentAssessmentRecord.assessmentType + ' assessment '
									+ studentAssessmentRecord.count + ' times in total. Date and raw score given below: \n \n';
								studentAssessmentRecord.indivAssessments.forEach((indivAssessment) => {
									/* Only the oldest assessment will be the oldest score, newest score will be updated if there is a newer assessment */
									if (studentAssessmentRecord.oldestScore === null) {
										studentAssessmentRecord.oldestScore = parseInt(indivAssessment.rawScore);
									}
									studentAssessmentRecord.newestScore = parseInt(indivAssessment.rawScore);
									/* Convert assessment completion date into date format */
									let indivAssessmentDate = dateTime.parse(indivAssessment.completed, 'DD/MM/YYYY HH:mm:ss');
									let indivAssessmentFormattedDate = dateTime.format(indivAssessmentDate, 'DDD MMMM YYYY');
									/* For each assessment, output the date and raw score */
									studentAssessmentRecord.output += 'Date: ' + indivAssessmentFormattedDate + ', Raw Score: '
										+ indivAssessment.rawScore + ' out of ' + studentAssessmentRecord.totalQuestions + '\n';
								});
								/* Check if progress has been positive or negative and add to the output */
								let scoreProgress = studentAssessmentRecord.newestScore - studentAssessmentRecord.oldestScore;
								studentAssessmentRecord.output += '\n' + selectedStudentFullName + ' got ' + scoreProgress;
								if (scoreProgress > 0) {
									studentAssessmentRecord.output += ' more ';
								} else {
									studentAssessmentRecord.output += ' less ';
								}
								studentAssessmentRecord.output += 'correct in the recent completed assessment than the oldest.'
								console.log(studentAssessmentRecord.output);
							});	
						} else {
							console.log(selectedStudentFullName + ' recently completed ' + selectedAssessmentMostRecentAssessmentName + ' assessment on '
								+ selectedAssessmentMostRecentAssessmentFormattedDate + '\n'
								+ 'He got ' + selectedAssessmentMostRecentRawScore + ' questions right out of ' + selectedAssessmentMostRecentTotalQuestions + '.'
								+ 'Feedback for wrong answers given below: \n' + ''
							);
						}
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

