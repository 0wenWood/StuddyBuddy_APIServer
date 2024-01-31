class Day {
    #days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
    constructor(date) {
        if (date instanceof Date && 
            typeof date.getDay === 'function') {
            this.day = this.convertNumberToDay(date.getDay());
        }
    }

    convertNumberToDay(num) {
        return this.#days[num];
    }
}

const DayEnum = Object.freeze({
    MONDAY: new Day(new Date(2024, 0, 1)),
    TUESDAY: new Day(new Date(2024, 0, 2)),
    WEDNESDAY: new Day(new Date(2024, 0, 3)),
    THURSDAY: new Day(new Date(2024, 0, 4)),
    FRIDAY: new Day(new Date(2024, 0, 5)),
    SATURDAY: new Day(new Date(2024, 0, 6)),
    SUNDAY: new Day(new Date(2024, 0, 7))
});

module.exports = DayEnum;