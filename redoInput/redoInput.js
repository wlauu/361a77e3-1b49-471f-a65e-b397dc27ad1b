#!/usr/bin/env node

// Used for asking questions to the user and getting user inputs
const readline = require('readline');

let errorMessage = 'Thank you for using this program.';

const redoInput = () => {
    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('\nDo you wish to generate another report: (y for Yes, otherwise No): ', (continueInput) => {
            rl.close();
            if (continueInput.toLowerCase() !== 'y') {
                reject(errorMessage);
            } else {
                resolve(continueInput);
            }
        });
    });
};

module.exports = {
    redoInput,
    _private: {
        errorMessage
    }
};