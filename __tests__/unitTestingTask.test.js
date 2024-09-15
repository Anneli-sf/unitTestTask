const unitTestingTask = require('../unitTestingTask');

const mockedLanguage = {
    months: jest.fn((date) => 'MockedMonth'),
    monthsShort: jest.fn((date) => 'MockedShortMonth'),
    weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
    meridiem: jest.fn((hours, isLower) => (isLower ? (hours > 11 ? 'pm' : 'am') : (hours > 11 ? 'PM' : 'AM')))
};

function mockCreateDateWithOffset(offsetMinutes) {
    const date = new Date();
    date.getTimezoneOffset = () => offsetMinutes;
    return date;
}

beforeEach(() => {
    unitTestingTask.lang('en', mockedLanguage);
});

describe('leadingZeroes', () => {
    test('returns number with leading zero in case of simple number', () => {
        expect(unitTestingTask.leadingZeroes(5)).toBe('05');
    });

    test('returns string if its length more than specified length', () => {
        expect(unitTestingTask.leadingZeroes('test', 3)).toBe('test');
    });
});

describe('formats date and time', () => {
    let date, dateAM, datePM;

    beforeAll(() => {
        date = new Date(Date.UTC(2024, 8, 11, 15, 2, 3));
        dateAM = new Date(Date.UTC(2024, 8, 11, 3, 2, 3));
        datePM = new Date(Date.UTC(2024, 8, 11, 15, 2, 3));
    });

    test('formats time-zone in ISO8601-compatible basic format (i.e. "+0400")', () => {
        const timeZoneZZ = unitTestingTask('ZZ', date);
        expect(timeZoneZZ).toBe('+0000');
    });

    test('formats time-zone ISO8601-compatible extended format (i.e. "-04:00")', () => {
        const timeZoneZ = unitTestingTask('Z', date);
        expect(timeZoneZ).toBe('+00:00');
    });

    test('format time - zone in ISO8601 - compatible basic format(i.e. "-0400")', () => {
        const date = mockCreateDateWithOffset(330);
        const formattedDate = unitTestingTask('ZZ', date);
        expect(formattedDate).toBe('-0530');
    });

    test('returns AM using meridiem function', () => {
        expect(unitTestingTask('A', dateAM)).toBe('AM');
        expect(mockedLanguage.meridiem).toHaveBeenCalledWith(3, false);
    });

    test('returns "pm" using meridiem function', () => {
        expect(unitTestingTask('a', datePM)).toBe('pm');
        expect(mockedLanguage.meridiem).toHaveBeenCalledWith(15, true);
    });

    test('throws Error for incorrect date', () => {
        const incorrectDate = true;
        expect(() => {
            unitTestingTask('YYYY', incorrectDate);
        }).toThrow('Argument `date` must be instance of Date or Unix Timestamp or ISODate String');
    });

    test('throw Error if format is not a string', () => {
        const format = 123;
        expect(() => {
            unitTestingTask(format, date);
        }).toThrow('Argument `format` must be a string');
    });
});

describe('formats tokens', () => {
    const date = new Date('2024-09-11T15:02:03.123Z');
    const dateAM = new Date('2024-09-11T03:02:03.000Z');
    const datePM = new Date('2024-09-11T15:02:03.000Z');
    const millisecondsDate = new Date('2024-09-11T15:02:03.023Z');
    const midnight = new Date('2024-09-11T00:00:00.000Z');

    test.each([
        ['YYYY', date, '2024'],
        ['YY', date, '24'],
        ['MMMM', date, 'MockedMonth'],
        ['MMM', date, 'MockedShortMonth'],
        ['MM', date, '09'],
        ['M', date, '9',],
        ['DDD', date, 'Wednesday'],
        ['DD', date, 'Wed'],
        ['D', date, 'We'],
        ['dd', date, '11'],
        ['d', date, '11'],
        ['HH', dateAM, '03'],
        ['H', date, '15'],
        ['hh', dateAM, '03'],
        ['hh', datePM, '03'],
        ['hh', midnight, '12'],
        ['h', dateAM, '3'],
        ['h', datePM, '3'],
        ['h', midnight, '12'],
        ['mm', date, '02'],
        ['m', date, '2'],
        ['ss', date, '03'],
        ['s', date, '3'],
        ['ff', millisecondsDate, '023'],
        ['f', millisecondsDate, '23'],
        ['A', dateAM, 'AM'],
        ['A', datePM, 'PM'],
        ['a', dateAM, 'am'],
        ['a', datePM, 'pm']
    ])("formats %s according to token's description", (format, date, expected) => {
        expect(unitTestingTask(format, date)).toBe(expected);
    });
})

describe('Reads formatting function with one argument — date', () => {
    beforeAll(() => {
        unitTestingTask.register('customDate', 'dd/MM/YYYY');
    });

    test('uses register to create custom format', () => {
        const date = new Date('2024-08-11T15:20:03.123Z');
        expect(unitTestingTask('customDate', date)).toBe('11/08/2024');
    });

    test('handles when date is not provided', () => {
        const date = new Date();
        expect(unitTestingTask('YYYY')).toBe(date.getFullYear().toString());
    });

    test('handles when date is not instanceof Date', () => {
        const dateString = '2024-08-11T15:20:03.123Z';
        const formattedDate = unitTestingTask('customDate', dateString);
        expect(formattedDate).toBe('11/08/2024');
    });

});

describe('lang function', () => {

    test('returns the current language', () => {
        expect(unitTestingTask.lang()).toBe('en');
    });

    test('changes and returns new language', () => {
        unitTestingTask.lang('fr', mockedLanguage);
        expect(unitTestingTask.lang()).toBe('fr');
    });

    test('returns new language', () => {
        expect(unitTestingTask.lang('fr')).toBe('fr');
    });

    test('fallback to default language if language not found', () => {
        expect(unitTestingTask.lang('han')).toBe('en');
    });
});









