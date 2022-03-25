const {
    reportIDinput,
    _private: { errorMessage }
} = require('./reportIDinput');
jest.unmock('./reportIDinput');
jest.unmock('mock-stdin');

describe('reportIDinput', () => {
    let stdin;

    beforeEach(() => {
        stdin = require('mock-stdin').stdin();
    });

    //Pass valid report ID
    it('passed valid report ID', async () => {
        const passedReport = '1';

        process.nextTick(() => {
            stdin.send(`${passedReport}\r`);
        });

        const result = await reportIDinput();

        expect(result).toBe(passedReport);
    });

    //Pass invalid report ID
    it('throws if passed invalid report ID', async () => {
        const passedReport = '5';

        process.nextTick(() => {
            stdin.send(`${passedReport}\r`);
        });

        try {
            await reportIDinput();
            expect('this should not be executed due to error catch').toBe(false);
        } catch (err) {
            expect(err).toBe(errorMessage);
        }
    });
});