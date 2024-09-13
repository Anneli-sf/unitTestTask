const unitTestingTask = require('../unitTestingTask');
require('../lang/be');

const mockedLanguage = {
    months: jest.fn((date) => 'MockedMonth'),
    monthsShort: jest.fn((date) => 'MockedShortMonth'),
    weekdays: 'Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday'.split('_'),
    weekdaysShort: 'Sun_Mon_Tue_Wed_Thu_Fri_Sat'.split('_'),
    weekdaysMin: 'Su_Mo_Tu_We_Th_Fr_Sa'.split('_'),
    meridiem: jest.fn((hours, isLower) => (isLower ? (hours >= 12 ? 'pm' : 'am') : (hours >= 12 ? 'PM' : 'AM')))
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
    test('return number with leading zero in case of simple number', () => {
        expect(unitTestingTask.leadingZeroes(5)).toBe('05');
    });

    test('return string if its length more than specified length', () => {
        expect(unitTestingTask.leadingZeroes('test', 3)).toBe('test');
    });
});

describe('format date and time', () => {
    let date, dateAM, datePM, millisecondsDate;

    beforeAll(() => {
        date = new Date(Date.UTC(2024, 8, 11, 15, 2, 3));
        dateAM = new Date(Date.UTC(2024, 8, 11, 3, 2, 3));
        datePM = new Date(Date.UTC(2024, 8, 11, 15, 2, 3));
        millisecondsDate = new Date(Date.UTC(2024, 7, 11, 15, 2, 3, 23));
        midnight = new Date(Date.UTC(2024, 8, 11, 0, 0, 0));
    });

    test('format full year as 4-digit year', () => {
        expect(unitTestingTask('YYYY', date)).toBe('2024');
    });

    test('format short year as last 2 digit of year', () => {
        expect(unitTestingTask('YY', date)).toBe('24');
    });

    test('format month as full name of month', () => {
        expect(unitTestingTask('MMMM', date)).toBe('MockedMonth');
    });

    test('format month as short name of month', () => {
        expect(unitTestingTask('MMM', date)).toBe('MockedShortMonth');
    });

    test('format month with leading zero as the number of month, where January is equal 01', () => {
        expect(unitTestingTask('MM', date)).toBe('09');
    });

    test('should format month without leading zero as the number of month, where January is equal 1', () => {
        expect(unitTestingTask('M', date)).toBe('9');
    });

    test('format day of week as full name of day', () => {
        expect(unitTestingTask('DDD', date)).toBe('Wednesday');
    });

    test('format day of week as short name of day', () => {
        expect(unitTestingTask('DD', date)).toBe('Wed');
    });

    test('format day of week as min name of day', () => {
        expect(unitTestingTask('D', date)).toBe('We');
    })

    test('format day of month as zero-padded number of day in month', () => {
        expect(unitTestingTask('dd', date)).toBe('11');
    });

    test('format day of month as number of day in month', () => {
        expect(unitTestingTask('d', date)).toBe('11');
    });

    test('format the hour as zero-padded hour in 24-hr format', () => {
        expect(unitTestingTask('HH', dateAM)).toBe('03');
    });

    test('format the hour as hour in 24-hr format', () => {
        expect(unitTestingTask('H', date)).toBe('15');
    });

    test('format the hour as zero-padded hour in 12-hr format', () => {
        expect(unitTestingTask('hh', dateAM)).toBe('03');
        expect(unitTestingTask('hh', datePM)).toBe('03');
        expect(unitTestingTask('hh', midnight)).toBe('12');
    });

    test('format the hour as hour in 12-hr format without zero-padded hour', () => {
        expect(unitTestingTask('h', dateAM)).toBe('3');
        expect(unitTestingTask('h', datePM)).toBe('3');
        expect(unitTestingTask('h', midnight)).toBe('12');
    });

    test('format the minutes as zero-padded minutes', () => {
        expect(unitTestingTask('mm', date)).toBe('02');
    });

    test('format seconds as zero-padded seconds', () => {
        expect(unitTestingTask('ss', date)).toBe('03');
    });

    test('format seconds without leading zero', () => {
        expect(unitTestingTask('s', date)).toBe('3');
    });

    test('format milliseconds as zero-padded milliseconds', () => {
        expect(unitTestingTask('ff', millisecondsDate)).toBe('023');
    });

    test('format milliseconds without leading zero', () => {
        expect(unitTestingTask('f', millisecondsDate)).toBe('23');
    });

    test('format date as AM/PM', () => {
        expect(unitTestingTask('A', dateAM)).toBe('AM');
        expect(unitTestingTask('A', datePM)).toBe('PM');
    });

    test('format date as am/pm', () => {
        expect(unitTestingTask('a', dateAM)).toBe('am');
        expect(unitTestingTask('a', datePM)).toBe('pm');
    });

    test('format time-zone in ISO8601-compatible basic format (i.e. "+0400")', () => {
        const timeZoneZZ = unitTestingTask('ZZ', date);
        expect(timeZoneZZ).toBe('+0000');
    });

    test('format time-zone ISO8601-compatible extended format (i.e. "-04:00")', () => {
        const timeZoneZ = unitTestingTask('Z', date);
        expect(timeZoneZ).toBe('+00:00');
    });

    test('format time - zone in ISO8601 - compatible basic format(i.e. "-0400")', () => {
        const date = mockCreateDateWithOffset(330);
        const formattedDate = unitTestingTask('ZZ', date);
        expect(formattedDate).toBe('-0530');
    });

    test('return AM using meridiem function', () => {
        expect(unitTestingTask('A', dateAM)).toBe('AM');
        expect(mockedLanguage.meridiem).toHaveBeenCalledWith(3, false);
    });

    test('return "pm" using meridiem function', () => {
        expect(unitTestingTask('a', datePM)).toBe('pm');
        expect(mockedLanguage.meridiem).toHaveBeenCalledWith(15, true);
    });

    test('throw Error for incorrect date', () => {
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

describe('Readied formatting function with one argument — date', () => {
    beforeAll(() => {
        unitTestingTask.register('customDate', 'dd/MM/YYYY');
    });

    test('use register to create custom format', () => {
        const date = new Date('2024-08-11T15:20:03.123Z');
        expect(unitTestingTask('customDate', date)).toBe('11/08/2024');
    });

    test('handle when date is not provided', () => {
        const date = new Date();
        expect(unitTestingTask('YYYY')).toBe(date.getFullYear().toString());
    });

    test('handle when date is not instanceof Date', () => {
        const dateString = '2024-08-11T15:20:03.123Z';
        const formattedDate = unitTestingTask('customDate', dateString);
        expect(formattedDate).toBe('11/08/2024');
    });

});

describe('lang function', () => {
    beforeAll(() => {
        unitTestingTask.lang('en', mockedLanguage);
    });

    test('return the current language', () => {
        expect(unitTestingTask.lang()).toBe('en');
    });

    test('change and return new language', () => {
        unitTestingTask.lang('fr', mockedLanguage);
        expect(unitTestingTask.lang()).toBe('fr');
    });

    test('fall back to default language if language not found', () => {
        expect(unitTestingTask.lang('han')).toBe('en');
    });
});









