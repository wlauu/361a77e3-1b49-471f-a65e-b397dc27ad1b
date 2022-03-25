const {
    studentIDinput,
    _private: { errorMessage }
} = require('./studentIDinput');
jest.unmock('./studentIDinput');
jest.unmock('mock-stdin');

describe('studentIDinput', () => {
    let stdin;

    beforeEach(() => {
        stdin = require('mock-stdin').stdin();
    });

    //Pass valid report ID
    it('passed valid student ID', async () => {
        const passedStudent = 'student1';

        process.nextTick(() => {
            stdin.send(`${passedStudent}\r`);
        });

        const result = await studentIDinput();

        expect(result).toBe(passedStudent);
    });

    //Pass invalid report ID
    it('throws if the passed invalid student ID', async () => {
        const passedStudent = 'Harry Kewell';

        process.nextTick(() => {
            stdin.send(`${passedStudent}\r`);
        });

        try {
            await studentIDinput();
            expect('this should not be executed due to error catch').toBe(false);
        } catch (err) {
            expect(err).toBe(errorMessage);
        }
    });
});