#!/usr/bin/env node

// Used for asking questions to the user and getting user inputs
const readline = require('readline');
// Used to query data from JSON files to be parsed
const fs = require('fs');

// Get data from required JSON file and set to variables for later use
const studentData = fs.readFileSync('./data/students.json');
const students = JSON.parse(studentData);

// Initially define null variables for the matched students against user inputs
let selectedStudent = null;

let errorMessage = '\r\nProvided student ID is invalid';

const studentIDinput = () => {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('Please enter the following\nStudent ID: ', (studentID) => {
            selectedStudent = students.find(student => student.id === studentID.trim());
            rl.close();
            if (typeof selectedStudent === 'undefined') {
                reject(errorMessage);
            } else {
                resolve(studentID);
            }
        });
    });
};

module.exports = {
    studentIDinput,
    _private: {
        errorMessage
    }
};