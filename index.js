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

const {
	studentIDinput
} = require('./studentIDinput/studentIDinput');
const {
	reportIDinput
} = require('./reportIDinput/reportIDinput');

let studentID = null;
let reportID = null;

const index = async () => {
	try {
		studentID = await studentIDinput();
		try {
			reportID = await reportIDinput();
			selectedStudent = students.find(student => student.id === studentID);
			selectedReport = selectedReport = reportTypes.find(report => report.id === reportID);
			// After finding matching student, set variable for student full name and ask user for report type
			let selectedStudentFullName = selectedStudent.firstName + ' ' + selectedStudent.lastName;
			// After finding matching report type, set variable for report type description
			let selectedReportDescription = selectedReport.description;
			// Get the most recent assessment (used in reports 1 and 3)
			let selectedAssessmentMostRecent = studentResponsesCompletedDateSortedDesc.find(
				studentResponse =>
					studentResponse.student.id === studentID.trim()
					&& typeof studentResponse.completed !== 'undefined'
			);
			// Get assessment name 
			let selectedAssessmentMostRecentAssessment = assessments.find(assessment => assessment.id === selectedAssessmentMostRecent.assessmentId);
			let selectedAssessmentMostRecentAssessmentName = selectedAssessmentMostRecentAssessment.name;
			// Convert assessment completion date into date format
			let selectedAssessmentMostRecentAssessmentDate = dateTime.parse(selectedAssessmentMostRecent.completed, 'DD/MM/YYYY HH:mm:ss');
			let selectedAssessmentMostRecentAssessmentFormattedDate = dateTime.format(selectedAssessmentMostRecentAssessmentDate, 'DDD MMMM YYYY hh:mm A');
			// Get student raw score
			let selectedAssessmentMostRecentRawScore = selectedAssessmentMostRecent.results.rawScore;
			// Get total question number of assessment
			let selectedAssessmentMostRecentTotalQuestions = selectedAssessmentMostRecent.responses.length;

			if (selectedReportDescription === 'Diagnostic') {
				// Diagnostic report
				let assessmentStrands = [];
				selectedAssessmentMostRecent.responses.forEach((questionResponse) => {
					// For each question, categorise according to strand and set variables to be used for output
					let matchingQuestion = questions.find(question => question.id === questionResponse.questionId);
					let matchedStrandsIndex = assessmentStrands.findIndex(strand => strand.strand === matchingQuestion.strand);
					if (matchedStrandsIndex === -1) {
						assessmentStrands.push({
							'strand': matchingQuestion.strand,
							'totalQuestions': 1,
							'noCorrect': 0,
						});
						matchedStrandsIndex = assessmentStrands.findIndex(strand => strand.strand === matchingQuestion.strand);
					} else {
						++assessmentStrands[matchedStrandsIndex].totalQuestions;
					}
					// Check if the student response to the question was correct and add to the correct count if so
					let isResponseCorrect = questionResponse.response === matchingQuestion.config.key ? 1 : 0;
					if (isResponseCorrect) {
						++assessmentStrands[matchedStrandsIndex].noCorrect;
					}
				});
				let diagnosticReportOutput = '\n' + selectedStudentFullName + ' recently completed ' + selectedAssessmentMostRecentAssessmentName + ' assessment on '
					+ selectedAssessmentMostRecentAssessmentFormattedDate + '\n'
					+ 'He got ' + selectedAssessmentMostRecentRawScore + ' questions right out of ' + selectedAssessmentMostRecentTotalQuestions + '. '
					+ 'Details by strand given below: \n \n';
				assessmentStrands.forEach((assessmentStrand, assessmentStrandIndex, assessmentStrandArray) => {
					diagnosticReportOutput += assessmentStrand.strand + ': ' + assessmentStrand.noCorrect + ' out of ' + assessmentStrand.totalQuestions;
					// Extra line break added if not the last assessment strand
					if (assessmentStrandIndex !== assessmentStrandArray.length - 1) {
						diagnosticReportOutput += '\n';
					}
				});
				console.log(diagnosticReportOutput);
				//Add back redo here
			} else
			if (selectedReportDescription === 'Progress') {
				// Progress report
				// Get only the assessments that match the student
				let studentAssessments = studentResponses.filter(
					studentResponse =>
						studentResponse.student.id === studentID.trim()
						&& typeof studentResponse.completed !== 'undefined'
				);
				// Get count for each type of assessment the student took, as well as other variables to be used in the output
				let studentAssessmentRecords = [];
				studentAssessments.forEach((studentAssessment) => {
					let matchedAssessmentIndex = studentAssessmentRecords.findIndex(assessmentType => assessmentType.assessmentId === studentAssessment.assessmentId);
					// If the assessment type has already been counted before, then add to the existing count
					if (matchedAssessmentIndex !== -1) {
						++studentAssessmentRecords[matchedAssessmentIndex].count;
					}
					else {
						// If the assessment type has not been counted before, add a new count for the assessment type as well as variables to be used for output
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
					// Store the completed date and raw score for each assessment to be used in the output
					studentAssessmentRecords[matchedAssessmentIndex].indivAssessments.push({
						'completed': studentAssessment.completed,
						'rawScore': studentAssessment.results.rawScore
					});
				});

				// Setup output for each type of assessment
				studentAssessmentRecords.forEach((studentAssessmentRecord, studentAssessmentRecordIndex, studentAssessmentRecordArray) => {
					studentAssessmentRecord.output = '\n' + selectedStudentFullName + ' has completed ' + studentAssessmentRecord.assessmentType + ' assessment '
						+ studentAssessmentRecord.count + ' times in total. Date and raw score given below: \n \n';
					studentAssessmentRecord.indivAssessments.forEach((indivAssessment) => {
						// Only the oldest assessment will be the oldest score, newest score will be updated if there is a newer assessment
						if (studentAssessmentRecord.oldestScore === null) {
							studentAssessmentRecord.oldestScore = parseInt(indivAssessment.rawScore);
						}
						studentAssessmentRecord.newestScore = parseInt(indivAssessment.rawScore);
						// Convert assessment completion date into date format
						let indivAssessmentDate = dateTime.parse(indivAssessment.completed, 'DD/MM/YYYY HH:mm:ss');
						let indivAssessmentFormattedDate = dateTime.format(indivAssessmentDate, 'DDD MMMM YYYY');
						// For each assessment, output the date and raw score
						studentAssessmentRecord.output += 'Date: ' + indivAssessmentFormattedDate + ', Raw Score: '
							+ indivAssessment.rawScore + ' out of ' + studentAssessmentRecord.totalQuestions + '\n';
					});
					// Check if progress has been positive or negative and add to the output
					let scoreProgress = studentAssessmentRecord.newestScore - studentAssessmentRecord.oldestScore;
					studentAssessmentRecord.output += '\n' + selectedStudentFullName + ' got ' + scoreProgress;
					if (scoreProgress > 0) {
						studentAssessmentRecord.output += ' more ';
					} else {
						studentAssessmentRecord.output += ' less ';
					}
					studentAssessmentRecord.output += 'correct in the recent completed assessment than the oldest.'
					console.log(studentAssessmentRecord.output);
					// Extra line break added if not the last assessment type
					if (studentAssessmentRecordIndex !== studentAssessmentRecordArray.length - 1) {
						console.log('\n');
					}
				});
				//Add back redo here
			} else {
				// Feedback report
				let assessmentIncorrectQuestions = [];
				selectedAssessmentMostRecent.responses.forEach((questionResponse) => {
					// For each question, check if student response was correct, and if not, add that question for output
					let matchingQuestion = questions.find(question => question.id === questionResponse.questionId);
					if (questionResponse.response !== matchingQuestion.config.key) {
						assessmentIncorrectQuestions.push({
							'question': matchingQuestion.stem,
							'studentResponse': matchingQuestion.config.options.find(option => option.id === questionResponse.response),
							'correctResponse': matchingQuestion.config.options.find(option => option.id === matchingQuestion.config.key),
							'hint': matchingQuestion.config.hint
						});
					}
				});
				let feedbackReportOutput = '\n' + selectedStudentFullName + ' recently completed ' + selectedAssessmentMostRecentAssessmentName + ' assessment on '
					+ selectedAssessmentMostRecentAssessmentFormattedDate + '\n';
				if (assessmentIncorrectQuestions.length > 0) {
					// If at least one incorrect question exists, output incorrect questions for report.
					feedbackReportOutput += 'He got ' + selectedAssessmentMostRecentRawScore + ' questions right out of ' + selectedAssessmentMostRecentTotalQuestions + '. '
						+ 'Feedback for wrong answers given below: \n \n';
					assessmentIncorrectQuestions.forEach((incorrectQuestion, incorrectQuestionIndex, incorrectQuestionArray) => {
						feedbackReportOutput += 'Question: ' + incorrectQuestion.question + '\n'
							+ 'Your answer: ' + incorrectQuestion.studentResponse.label + ' with value ' + incorrectQuestion.studentResponse.value + '\n'
							+ 'Right answer: ' + incorrectQuestion.correctResponse.label + ' with value ' + incorrectQuestion.correctResponse.value + '\n'
							+ 'Hint: ' + incorrectQuestion.hint;
						if (incorrectQuestionIndex !== incorrectQuestionArray.length - 1) {
							feedbackReportOutput += '\n \n';
						}
					});
				} else {
					// All questions in the assessment were answered correctly.
					feedbackReportOutput += 'He got all questions right.';
				}
				console.log(feedbackReportOutput);
				//Add back redo here
			}
		} catch (e) {
			console.error(e);
        }
	} catch (e) {
		console.error(e);
	}
}

init({ clear });
input.includes(`help`) && cli.showHelp(0);
debug && log(flags);

index();