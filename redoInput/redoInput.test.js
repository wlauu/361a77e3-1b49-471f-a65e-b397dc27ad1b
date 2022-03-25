const {
    redoInput,
    _private: { errorMessage }
} = require('./redoInput');
jest.unmock('./redoInput');
jest.unmock('mock-stdin');

describe('redoInput', () => {
    let stdin;

    beforeEach(() => {
        stdin = require('mock-stdin').stdin();
    });

    //Pass valid report ID
    it('passed y for yes to redo', async () => {
        const providedReport = 'y';

        process.nextTick(() => {
            stdin.send(`${providedReport}\r`);
        });

        const result = await redoInput();

        expect(result).toBe(providedReport);
    });

    //Pass invalid report ID
    it('if passed value other than y', async () => {
        const providedReport = 'Yabadabadoo!';

        process.nextTick(() => {
            stdin.send(`${providedReport}\r`);
        });

        try {
            await redoInput();
            expect('this should not be executed due to error catch').toBe(false);
        } catch (err) {
            expect(err).toBe(errorMessage);
        }
    });
});