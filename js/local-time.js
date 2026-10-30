// Local time display for events
//
// Shows each event's time in the visitor's own time zone. The calculation
// happens in the visitor's browser, and nothing is sent anywhere.
//
// The HTML is the single source for each event: its exact start and end are
// written once, as data attributes, and this script reads them. To add another
// event, copy an event block in the HTML and change the dates and text. This
// script needs no edits.
//
//   <ul class="list-unstyled"
//       data-event-start="2026-11-09T08:00:00-08:00"
//       data-event-end="2026-11-09T09:00:00-08:00">
//     <li data-event-local hidden>
//       <strong>When (in your time zone):</strong> <span data-event-local-text></span>
//     </li>
//     <li data-event-host>Monday, November 9, 2026, 8–9 AM PT</li>
//   </ul>
//
// The start and end must include the host's UTC offset (for example -08:00 for
// Pacific Standard Time, -07:00 for Pacific Daylight Time).
//
// The host line (data-event-host) always ships in the page, so it still shows
// when JavaScript is off or anything fails. For visitors on the host's own
// offset, the script hides it, since their own line would repeat it.

(function () {
    'use strict';

    // The page is in English, so dates, times, and zone names are too
    var LOCALE = 'en-US';

    if (typeof Intl === 'undefined' || !Intl.DateTimeFormat) {
        return;
    }

    // Look up one style of time zone name, such as "EST" or "India Standard Time"
    function lookupZoneName(locale, style, date) {
        var parts = new Intl.DateTimeFormat(locale, {
            hour: 'numeric',
            timeZoneName: style
        }).formatToParts(date);
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
    function getZoneName(date) {
        var attempts = [
            [LOCALE, 'short'],
            ['en-GB', 'short'],
            [LOCALE, 'longGeneric']
        ];
        for (var i = 0; i < attempts.length; i++) {
            try {
                var name = lookupZoneName(attempts[i][0], attempts[i][1], date);
                if (name && !isOffsetName(name)) {
                    return name;
                }
            } catch (e) {
                // Try the next style
            }
        }
        return lookupZoneName(LOCALE, 'short', date);
    }

    // Join two formatted times when Intl.DateTimeFormat.formatRange is unavailable
    function formatRange(format, start, end) {
        if (typeof format.formatRange === 'function') {
            return format.formatRange(start, end);
        }
        return format.format(start) + ' \u2013 ' + format.format(end);
    }

    // Read the host's UTC offset from the end of an ISO date, in the same units
    // as Date.getTimezoneOffset(): -08:00 gives 480, +05:30 gives -330.
    // Returns null when the date has no offset (for example, a trailing Z).
    function getHostOffsetMinutes(isoString) {
        var match = /([+\-])(\d{2}):?(\d{2})$/.exec(isoString);
        if (!match) {
            return null;
        }
        var minutes = parseInt(match[2], 10) * 60 + parseInt(match[3], 10);
        return match[1] === '-' ? minutes : -minutes;
    }

    // Build the visitor's line for one event, e.g. "Monday, November 9, 2026, 5 – 6 PM CET"
    function buildLocalText(start, end) {
        var dayOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        var timeOptions = { hour: 'numeric' };

        // Show minutes only for zones that need them, such as India (9:30 PM)
        if (start.getMinutes() !== 0) {
            timeOptions.minute = '2-digit';
        }

        var dayFormat = new Intl.DateTimeFormat(LOCALE, dayOptions);
        var timeFormat = new Intl.DateTimeFormat(LOCALE, timeOptions);
        var text;

        if (!end) {
            text = dayFormat.format(start) + ', ' + timeFormat.format(start);
        } else if (dayFormat.format(start) === dayFormat.format(end)) {
            text = dayFormat.format(start) + ', ' + formatRange(timeFormat, start, end);
        } else {
            // The event crosses midnight for this visitor, so show both dates
            var fullOptions = Object.assign({}, dayOptions, timeOptions);
            text = formatRange(new Intl.DateTimeFormat(LOCALE, fullOptions), start, end);
        }

        return text + ' ' + getZoneName(start);
    }

    function showLocalTime(eventElement) {
        var startAttr = eventElement.getAttribute('data-event-start');
        var endAttr = eventElement.getAttribute('data-event-end');
        var start = new Date(startAttr);
        var end = endAttr ? new Date(endAttr) : null;

        var localRow = eventElement.querySelector('[data-event-local]');
        var localText = eventElement.querySelector('[data-event-local-text]');
        var hostLine = eventElement.querySelector('[data-event-host]');

        if (!localRow || !localText || isNaN(start.getTime()) || (end && isNaN(end.getTime()))) {
            return;
        }

        localText.textContent = buildLocalText(start, end);
        localRow.hidden = false;

        // Hide the host line only after the visitor's own line is showing, and only
        // for visitors on the host's own offset, so a failure never leaves a page
        // without a time
        var hostOffset = getHostOffsetMinutes(startAttr);
        if (hostLine && hostOffset !== null && start.getTimezoneOffset() === hostOffset) {
            hostLine.hidden = true;
        }
    }

    var events = document.querySelectorAll('[data-event-start]');
    for (var i = 0; i < events.length; i++) {
        try {
            showLocalTime(events[i]);
        } catch (e) {
            // Leave this event's host line as it is; other events still run
        }
    }
})();
