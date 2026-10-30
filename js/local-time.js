// Local time display for the inaugural event
//
// The HTML holds the label ("Your time:") and the empty spot for the time. This
// script only fills in the part that depends on where the visitor is.
//
// Shows the event time in the visitor's own time zone. The calculation happens
// in the visitor's browser, and nothing is sent anywhere. The page ships with a
// Pacific time line. This script adds the visitor's own time above it, and hides
// the Pacific line for visitors who are already on Pacific time. If JavaScript
// is off or anything fails, the Pacific time line stays and still tells people
// when the event is.

(function () {
    'use strict';

    // The event as exact moments: 8-9 AM Pacific Standard Time (UTC-8), Nov 9, 2026
    var START = new Date('2026-11-09T08:00:00-08:00');
    var END = new Date('2026-11-09T09:00:00-08:00');

    // Value of getTimezoneOffset() for Pacific Standard Time
    var PACIFIC_OFFSET_MINUTES = 480;

    // The page is in English, so dates, times, and zone names are too
    var LOCALE = 'en-US';

    var output = document.getElementById('local-time');
    var outputRow = document.getElementById('local-time-row');
    var pacificLine = document.getElementById('pacific-time');
    if (!output || !outputRow || typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
        return;
    }

    // Visitors in Pacific time see their own line only, not the Pacific line again
    var isPacificVisitor = START.getTimezoneOffset() === PACIFIC_OFFSET_MINUTES;

    // Look up one style of time zone name, such as "EST" or "India Standard Time"
    function lookupZoneName(locale, style) {
        var parts = new Intl.DateTimeFormat(locale, {
            hour: 'numeric',
            timeZoneName: style
        }).formatToParts(START);
        for (var i = 0; i < parts.length; i++) {
            if (parts[i].type === 'timeZoneName') {
                return parts[i].value;
            }
        }
        return '';
    }

    // Offsets such as "GMT+13" are what browsers fall back to when they have no
    // familiar name for a zone, so they are only used as a last resort
    function isOffsetName(name) {
        return /^GMT[+\-\u2212]/.test(name);
    }

    // Pick the most familiar name for the visitor's time zone:
    //   1. a short abbreviation, such as EST, GMT, or PST
    //   2. a British-English abbreviation, such as CET or EET (Europe)
    //   3. a full name, such as India Standard Time or New Zealand Time
    function getZoneName() {
        var attempts = [
            [LOCALE, 'short'],
            ['en-GB', 'short'],
            [LOCALE, 'longGeneric']
        ];
        for (var i = 0; i < attempts.length; i++) {
            try {
                var name = lookupZoneName(attempts[i][0], attempts[i][1]);
                if (name && !isOffsetName(name)) {
                    return name;
                }
            } catch (e) {
                // Try the next style
            }
        }
        return lookupZoneName(LOCALE, 'short');
    }

    // Join two formatted times when Intl.DateTimeFormat.formatRange is unavailable
    function formatRange(format, start, end) {
        if (typeof format.formatRange === 'function') {
            return format.formatRange(start, end);
        }
        return format.format(start) + ' \u2013 ' + format.format(end);
    }

    try {
        var dayOptions = { weekday: 'long', month: 'long', day: 'numeric' };
        var timeOptions = { hour: 'numeric' };

        // Show minutes only for zones that need them, such as India (9:30 PM)
        if (START.getMinutes() !== 0) {
            timeOptions.minute = '2-digit';
        }

        var dayFormat = new Intl.DateTimeFormat(LOCALE, dayOptions);
        var timeFormat = new Intl.DateTimeFormat(LOCALE, timeOptions);
        var text;

        if (dayFormat.format(START) === dayFormat.format(END)) {
            text = dayFormat.format(START) + ', ' + formatRange(timeFormat, START, END);
        } else {
            // The hour crosses midnight for this visitor, so show both dates
            var fullOptions = Object.assign({}, dayOptions, timeOptions);
            text = formatRange(new Intl.DateTimeFormat(LOCALE, fullOptions), START, END);
        }

        output.textContent = text + ' ' + getZoneName();
        outputRow.hidden = false;

        // Hide the Pacific line only after the visitor's own line is showing
        if (isPacificVisitor && pacificLine) {
            pacificLine.hidden = true;
        }
    } catch (e) {
        // Leave the line hidden; the Pacific time line remains accurate
    }
})();