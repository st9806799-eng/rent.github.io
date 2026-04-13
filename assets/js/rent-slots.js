(function (global) {
  function parseHm(s) {
    var parts = String(s).split(":");
    var h = parseInt(parts[0], 10) || 0;
    var m = parseInt(parts[1], 10) || 0;
    return { h: h, m: m };
  }

  function getHoursForDay(hoursRows, dayOfWeek) {
    for (var i = 0; i < hoursRows.length; i++) {
      if (hoursRows[i].dayOfWeek === dayOfWeek) return hoursRows[i];
    }
    return undefined;
  }

  function slotsForDay(day, hoursRows, durationMinutes, stepMinutes) {
    var dow = day.getDay();
    var row = getHoursForDay(hoursRows, dow);
    if (!row || !row.isOpen) return [];

    var open = parseHm(row.openTime);
    var close = parseHm(row.closeTime);
    var openM = open.h * 60 + open.m;
    var closeM = close.h * 60 + close.m;
    if (closeM <= openM) return [];

    var out = [];
    var base = new Date(day);
    base.setHours(0, 0, 0, 0);
    var step = stepMinutes || 30;

    for (var t = openM; t + durationMinutes <= closeM; t += step) {
      var start = new Date(base);
      start.setHours(Math.floor(t / 60), t % 60, 0, 0);
      if (start.getTime() >= Date.now() - 60 * 1000) out.push(start);
    }
    return out;
  }

  function overlap(aStart, aEnd, bStart, bEnd) {
    return aStart < bEnd && bStart < aEnd;
  }

  global.RentSlots = {
    parseHm: parseHm,
    getHoursForDay: getHoursForDay,
    slotsForDay: slotsForDay,
    overlap: overlap,
  };
})(typeof window !== "undefined" ? window : this);
