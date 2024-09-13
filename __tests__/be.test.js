const unitTestingTask = require('../unitTestingTask');
require('../lang/be');

describe('Belarusian Language', () => {

    let date, dateAM, datePM, millisecondsDate;

    beforeAll(() => {
        date = new Date(Date.UTC(2024, 8, 11, 15, 2, 3));
        dateAM = new Date(Date.UTC(2024, 8, 11, 3, 2, 3));
        datePM = new Date(Date.UTC(2024, 8, 11, 15, 2, 3));
        millisecondsDate = new Date(Date.UTC(2024, 7, 11, 15, 2, 3, 23));
    });

    test('format month as full name of month', () => {
        expect(unitTestingTask('MMMM', date)).toBe('верасень');
    });

    test('should format weekdays', () => {
        expect(unitTestingTask('DDD', date)).toBe('серада');
    });
});