# 361a77e3-1b49-471f-a65e-b397dc27ad1b
ACER Coding Challenge

<h1>Startup</h1>

Firstly, please ensure that NodeJS is installed (the installer can be found online at nodejs.org.  
To start the CLI application, open a Command Line interpreter such as Windows Command Prompt (cmd.exe) or Windows PowerShell.  
Redirect to the directory root of the CLI application.  
Before running the application, type in "npm update" to ensure all required JavaScript packages have been installed as otherwise the application will not run.

<h1>Running the application</h1>

To start the CLI application, enter "npm run app".  
Inputting any of the following will also start the CLI application - "acerCodingChallenge", "acc", "app" or "node .\index.js".

<b>1.</b> Upon starting the CLI application, you will be greeted with a startup message by the application, and then asked to enter a student ID. This is not case sensitive.  
If the student ID entered does not exist, you will be prompted as such, and asked if you wish to try generating another report.  
Saying "y" for yes will start the process again, otherwise you will exit the program.

<b>2.</b> If the student ID does exist, you will then be asked to enter a report type ID corresponding to one of 3 different reports. The report description can also be used.  
If the report type ID entered does not match a recognised report, you will be prompted that the report type entered does not exist, and asked if you wish to try generating another report.  
Saying "y" for yes will start the process again, otherwise you will exit the program.

<b>3.</b> If the report type ID entered does match one of the recognised report, the report corresponding to the report type ID inputted by the user will be generated for the respective student ID.  

<b>Diagnostic</b>  
If the report selected to be generated is "Diagnostic", then the following will be detailed based on the student's most recent completed assessment':  
- student name 
- assessment type
- date of completion
- number of questions correctly answered for the entire assessment
- number of questions correctly answered for each strand in the asssessment

<b>Progress</b>  
If the report selected to be generated is "Progress", then the following will be detailed based on all assessments completed by the student:  
- student name
- assessment type
- number of times completing assessment type
- date of completion for each assessment
- raw score for each assessment
- comparing raw score of oldest assessment compared to most recent assessment

<b>Feedback</b>  
If the report selected to be generated is "Feedback", then the following will be detailed based on the student's most recent completed assessment':  
- student name
- assessment type
- date of completion
- breakdown of each question answered incorrectly showing the question, the student's response, the correct response, and the hint for the question.  

<b>4.</b> Upon successfully generating a report, you will be asked if you wish to generate another report.  
Saying "y" for yes will start the process again, otherwise you will exit the program.

<h1>Testing the application</h1>

Some unit tests have been set up for the three user inputs (studentID, reportID and redo), using Jest. The testing script can be run with "npm run test", and tests both a valid input as well as an invalid input.
