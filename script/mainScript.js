// ------------------------------------------------------------
// TEMPLATES
// ------------------------------------------------------------
const EVENT_TEMPLATES = {
    // Butterfly
    "50B": {
        id: "50B",
        name: "50m Butterfly",
        checkpoints: [15, 25, 35, 50],
        description: "Input at 15 m, 25 m, 35 m and 50 m."
    },
    "100B": {
        id: "100B",
        name: "100m Butterfly",
        checkpoints: [15, 50, 100],
        description: "Input at 15 m, 50 m and 100 m."
    },
    "200B": {
        id: "200B",
        name: "200m Butterfly",
        checkpoints: [15, 50, 100, 150, 200],
        description: "Input at 15 m, 50 m, 100 m, 150 m and 200 m."
    },

    // Backstroke
    "50BK": {
        id: "50BK",
        name: "50m Backstroke",
        checkpoints: [15, 25, 35, 50],
        description: "Input at 15 m, 25 m, 35 m and 50 m."
    },
    "100BK": {
        id: "100BK",
        name: "100m Backstroke",
        checkpoints: [15, 50, 100],
        description: "Input at 15 m, 50 m and 100 m."
    },
    "200BK": {
        id: "200BK",
        name: "200m Backstroke",
        checkpoints: [15, 50, 100, 150, 200],
        description: "Input at 15 m, 50 m, 100 m, 150 m and 200 m."
    },

    // Breaststroke
    "50BR": {
        id: "50BR",
        name: "50m Breaststroke",
        checkpoints: [15, 25, 35, 50],
        description: "Input at 15 m, 25 m, 35 m and 50 m."
    },
    "100BR": {
        id: "100BR",
        name: "100m Breaststroke",
        checkpoints: [15, 50, 100],
        description: "Input at 15 m, 50 m and 100 m."
    },
    "200BR": {
        id: "200BR",
        name: "200m Breaststroke",
        checkpoints: [15, 50, 100, 150, 200],
        description: "Input at 15 m, 50 m, 100 m, 150 m and 200 m."
    },

    // Freestyle
    "50F": {
        id: "50F",
        name: "50m Freestyle",
        checkpoints: [15, 25, 35, 50],
        description: "Input at 15 m, 25 m, 35 m and 50 m."
    },
    "100F": {
        id: "100F",
        name: "100m Freestyle",
        checkpoints: [15, 50, 100],
        description: "Input at 15 m, 50 m and 100 m."
    },
    "200F": {
        id: "200F",
        name: "200m Freestyle",
        checkpoints: [15, 50, 100, 150, 200],
        description: "Input at 15 m, 50 m, 100 m, 150 m and 200 m."
    },
    "400F": {
        id: "400F",
        name: "400m Freestyle",
        checkpoints: [50, 100, 150, 200, 250, 300, 350, 400],
        description: "Input at every 50 m split."
    },
    "800F": {
        id: "800F",
        name: "800m Freestyle",
        checkpoints: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800],
        description: "Input at every 50 m split."
    },
    "1500F": {
        id: "1500F",
        name: "1500m Freestyle",
        checkpoints: [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100, 1200, 1300, 1400, 1500],
        description: "Input at every 100 m split."
    },

    // Individual Medley
    "100IM": {
        id: "100IM",
        name: "100m IM",
        checkpoints: [15, 25, 50, 75, 100],
        description: "Input at 15 m, 25 m, 50 m, 75 m and 100 m."
    },
    "200IM": {
        id: "200IM",
        name: "200m IM",
        checkpoints: [15, 50, 100, 150, 200],
        description: "Input at 15 m, 50 m, 100 m, 150 m and 200 m."
    }
};


// ------------------------------------------------------------
// STATE
// ------------------------------------------------------------
let selectedEventId = "50F";
let currentTemplate = EVENT_TEMPLATES[selectedEventId];

const eventSelect = document.getElementById("eventSelect");
const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const restartBtn = document.getElementById("restartBtn");
const splitForm = document.getElementById("splitForm");

const screenStart = document.getElementById("screen-start");
const screenInput = document.getElementById("screen-input");
const screenResult = document.getElementById("screen-result");

// ------------------------------------------------------------
// HELPER
// ------------------------------------------------------------
function showScreen(screenName) {
    [screenStart, screenInput, screenResult].forEach(el => el.classList.remove("active"));
    if (screenName === "start") screenStart.classList.add("active");
    if (screenName === "input") screenInput.classList.add("active");
    if (screenName === "result") screenResult.classList.add("active");
}

function formatTime(seconds) {
    if (seconds === null || seconds === undefined || Number.isNaN(seconds))
        return "-";

    const minutes = Math.floor(seconds / 60);
    const restSeconds = seconds - minutes * 60;

    if (minutes === 0) {
        return restSeconds.toFixed(2).replace(".", ",");
    }

    return `${minutes}:${restSeconds
        .toFixed(2)
        .replace(".", ",")
        .padStart(5, "0")}`;
}

function formatSpeed(speed) {
    if (speed === null || speed === undefined || Number.isNaN(speed)) return "-";
    return `${speed.toFixed(2)} m/s`;
}

function calcSectionTimes(checkpoints, cumulativeTimes) {
    return checkpoints.map((checkpoint, index) => {
        const currentTime = cumulativeTimes[index];
        const previousTime = index === 0 ? 0 : cumulativeTimes[index - 1];
        const sectionDistance = index === 0 ? checkpoint : checkpoint - checkpoints[index - 1];
        const sectionTime = currentTime - previousTime;
        const sectionSpeed = sectionDistance / sectionTime;

        return {
            label: index === 0 ? `0-${checkpoint} m` : `${checkpoints[index - 1]}-${checkpoint} m`,
            distance: sectionDistance,
            time: sectionTime,
            speed: sectionSpeed
        };
    });
}

function calcAverageSpeed(totalDistance, totalTime) {
    return totalDistance / totalTime;
}

function calcSpeedLossPercent(startSpeed, laterSpeed) {
    return ((startSpeed - laterSpeed) / startSpeed) * 100;
}

function sectionComparisonText(speedLossPercent) {
    if (speedLossPercent > 10) return "++";
    if (speedLossPercent > 5) return "+";
    return "=";
}

function formatDateEuropean(dateString) {
    if (!dateString) return "---";
    const [year, month, day] = dateString.split("-");
    return `${day}.${month}.${year}`;
}

function calcSectionTimesFromFilledPoints(filledPoints) {
    return filledPoints.map((point, index) => {
        const prevPoint = index === 0 ? { distance: 0, time: 0 } : filledPoints[index - 1];
        const sectionDistance = point.distance - prevPoint.distance;
        const sectionTime = point.time - prevPoint.time;

        return {
            label: `${prevPoint.distance}-${point.distance} m`,
            distance: sectionDistance,
            time: sectionTime,
            speed: sectionDistance / sectionTime
        };
    });
}

function parseTime(timeString) {
    if (!timeString) return NaN;

    timeString = timeString.trim().replace(",", ".");

    // Minutenformat (z.B. 1:06.97)
    if (timeString.includes(":")) {
        const parts = timeString.split(":");

        if (parts.length !== 2) return NaN;

        const minutes = Number(parts[0]);
        const seconds = Number(parts[1]);

        if (Number.isNaN(minutes) || Number.isNaN(seconds)) return NaN;

        return minutes * 60 + seconds;
    }

    // Nur Sekunden (z.B. 29.53)
    return Number(timeString);
}
// ------------------------------------------------------------
// STARTING SITE
// ------------------------------------------------------------
function initEventSelect() {
    eventSelect.innerHTML = "";

    Object.values(EVENT_TEMPLATES).forEach(template => {
        const option = document.createElement("option");
        option.value = template.id;
        option.textContent = template.name;
        eventSelect.appendChild(option);
    });

    eventSelect.value = selectedEventId;
}

// ------------------------------------------------------------
// DYNAMIC FORMULAR
// ------------------------------------------------------------
function renderInputForm(template) {
    document.getElementById("eventTitle").textContent = template.name;
    document.getElementById("eventMeta").textContent = template.description;

    splitForm.innerHTML = "";

    const intro = document.createElement("p");
    intro.className = "muted";
    intro.textContent = "Enter cumulative data";
    splitForm.appendChild(intro);

    function getTodayForDateInput() {
        const d = new Date();
        const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        return local.toISOString().slice(0, 10);
    }

    const swimmerField = document.createElement("div");
    swimmerField.className = "field";

    const swimmerLabel = document.createElement("label");
    swimmerLabel.setAttribute("for", "swimmerName");
    swimmerLabel.textContent = "Swimmer name";

    const nameInput = document.createElement("input");
    nameInput.type = "text";
    nameInput.id = "swimmerName";
    nameInput.name = "swimmerName";
    nameInput.placeholder = "Last name, first name";

    swimmerField.appendChild(swimmerLabel);
    swimmerField.appendChild(nameInput);
    splitForm.appendChild(swimmerField);

    const dateField = document.createElement("div");
    dateField.className = "field";

    const dateLabel = document.createElement("label");
    dateLabel.setAttribute("for", "raceDate");
    dateLabel.textContent = "Date";

    const dateRow = document.createElement("div");
    dateRow.style.display = "grid";
    dateRow.style.gridTemplateColumns = "1fr auto";
    dateRow.style.gap = "8px";

    const dateInput = document.createElement("input");
    dateInput.type = "date";
    dateInput.id = "raceDate";
    dateInput.name = "raceDate";

    const todayBtn = document.createElement("button");
    todayBtn.type = "button";
    todayBtn.className = "btn";
    todayBtn.style.width = "auto";
    todayBtn.textContent = "Today";
    todayBtn.addEventListener("click", () => {
        dateInput.value = getTodayForDateInput();
    });

    dateRow.appendChild(dateInput);
    dateRow.appendChild(todayBtn);

    dateField.appendChild(dateLabel);
    dateField.appendChild(dateRow);
    splitForm.appendChild(dateField);

    template.checkpoints.forEach((checkpoint) => {
        const field = document.createElement("div");
        field.className = "field";

        const label = document.createElement("label");
        label.setAttribute("for", `cp_${checkpoint}`);
        label.textContent = `Time at ${checkpoint} m`;

        const input = document.createElement("input");
        input.type = "text";
        input.id = `cp_${checkpoint}`;
        input.name = `cp_${checkpoint}`;
        input.placeholder = "e.g. 6.20";

        field.appendChild(label);
        field.appendChild(input);
        splitForm.appendChild(field);
    });

    const strokeField = document.createElement("div");
    strokeField.className = "field";

    const strokeLabel = document.createElement("label");
    strokeLabel.setAttribute("for", "strokeCount");
    strokeLabel.textContent = "Stroke count (optional)";

    const strokeInput = document.createElement("input");
    strokeInput.type = "text";
    strokeInput.id = "strokeCount";
    strokeInput.name = "strokeCount";
    strokeInput.placeholder = "optional";

    strokeField.appendChild(strokeLabel);
    strokeField.appendChild(strokeInput);
    splitForm.appendChild(strokeField);
}

// ------------------------------------------------------------
// ANALYSIS
// ------------------------------------------------------------
function analyzeRace(template, formData) {
    const swimmerName = (formData.get("swimmerName") || "").trim();
    const raceDate = (formData.get("raceDate") || "").trim();

    const checkpointData = template.checkpoints.map(cp => {
        const raw = formData.get(`cp_${cp}`);
    
        const time =
            raw === "" || raw === null
                ? null
                : parseTime(raw);
    
        return {
            distance: cp,
            time
        };
    });

    console.log(checkpointData);

    const strokeCountRaw = formData.get("strokeCount");
    const strokeCount = strokeCountRaw === null || strokeCountRaw === "" ? null : String(strokeCountRaw).trim();

    const filledPoints = checkpointData.filter(cp => cp.time !== null && !Number.isNaN(cp.time) && cp.time > 0);

    if (filledPoints.length === 0) {
        throw new Error("Please enter at least one split time.");
    }

    for (let i = 1; i < filledPoints.length; i++) {
        if (filledPoints[i].time <= filledPoints[i - 1].time) {
            throw new Error("Times need to continue increasing.");
        }
    }

    const totalDistance = filledPoints[filledPoints.length - 1].distance;
    const totalTime = filledPoints[filledPoints.length - 1].time;
    const avgSpeed = calcAverageSpeed(totalDistance, totalTime);

    const sections = calcSectionTimesFromFilledPoints(filledPoints);
    const sectionSpeeds = sections.map(s => s.speed);

    const startSpeed = sectionSpeeds[0];
    const lastSpeed = sectionSpeeds[sectionSpeeds.length - 1];
    const speedLossPercent = sectionSpeeds.length > 1 ? calcSpeedLossPercent(startSpeed, lastSpeed) : 0;

    const fastestSection = sections.reduce((best, current) => current.speed > best.speed ? current : best, sections[0]);
    const slowestSection = sections.reduce((worst, current) => current.speed < worst.speed ? current : worst, sections[0]);

    return {
        swimmerName,
        raceDate,
        totalDistance,
        totalTime,
        avgSpeed,
        sections,
        checkpointData,
        strokeCount,
        startSpeed,
        lastSpeed,
        speedLossPercent,
        fastestSection,
        slowestSection
    };
}

// ------------------------------------------------------------
// CREATE TABLES
// ------------------------------------------------------------
function buildTable(headers, rows) {
    const thead = `<tr>${headers.map(h => `<th>${h}</th>`).join("")}</tr>`;
    const tbody = rows.map(row => `<tr>${row.map(cell => `<td>${cell}</td>`).join("")}</tr>`).join("");
    return `${thead}${tbody}`;
}

// ------------------------------------------------------------
// SHOW RESULTS
// ------------------------------------------------------------
function renderResults(template, result) {
    const dateText = formatDateEuropean(result.raceDate);
    document.getElementById("nameFieldLabel").textContent = `Swimmer: ${result.swimmerName || "Unknown"}`;

    document.getElementById("resultMeta").textContent = `${template.name} - ${dateText} | Analysis based on entered data.`;

    const summaryText = sectionComparisonText(result.speedLossPercent);
    document.getElementById("resultSummary").innerHTML = `
            <div class="table-wrap">
              <table>
                <tr><th colspan="2">Short overview</th></tr>
                <tr><td>End time</td><td>${formatTime(result.totalTime)}</td></tr>
                <tr><td>v avg.</td><td>${formatSpeed(result.avgSpeed)}</td></tr>
                <tr><td>v first seg.</td><td>${formatSpeed(result.startSpeed)}</td></tr>
                <tr><td>v last seg.</td><td>${formatSpeed(result.lastSpeed)}</td></tr>
                <tr><td>Speed loss</td><td>${result.speedLossPercent.toFixed(2)} %</td></tr>
                <tr><td>Evaluation</td><td>${summaryText}</td></tr>
              </table>
            </div>
          `;

    const sectionRows = result.sections.map(section => [
        section.label,
        `${section.distance.toFixed(0)} m`,
        formatTime(section.time),
        formatSpeed(section.speed)
    ]);

    document.getElementById("sectionTable").innerHTML = buildTable(
        ["Segment", "Distance", "Split", "v"],
        sectionRows
    );

    const summaryRows = [
        ["Total distance", `${result.totalDistance.toFixed(0)} m`],
        ["End time", formatTime(result.totalTime)],
        ["v avg.", formatSpeed(result.avgSpeed)],
        ["v fastest seg.", `${result.fastestSection.label} (${formatSpeed(result.fastestSection.speed)})`],
        ["v slowest seg.", `${result.slowestSection.label} (${formatSpeed(result.slowestSection.speed)})`],
        ["Stroke count", result.strokeCount === null ? "---" : String(result.strokeCount)],
    ];

    document.getElementById("summaryTable").innerHTML = buildTable(
        ["Index", "Value"],
        summaryRows
    );

    const rawRows = result.checkpointData
        .filter(cp => cp.time !== null && !Number.isNaN(cp.time) && cp.time > 0)
        .map(cp => [
            `${cp.distance} m`,
            formatTime(cp.time)
        ]);

    rawRows.push([
        "Stroke count",
        result.strokeCount === null || result.strokeCount === "" ? "---" : result.strokeCount
    ]);

    document.getElementById("rawTable").innerHTML = buildTable(
        ["Input", "Value"],
        rawRows
    );
}

// ------------------------------------------------------------
// EVENTS
// ------------------------------------------------------------
startBtn.addEventListener("click", () => {
    selectedEventId = eventSelect.value;
    currentTemplate = EVENT_TEMPLATES[selectedEventId];
    renderInputForm(currentTemplate);
    showScreen("input");
});

backBtn.addEventListener("click", () => {
    showScreen("start");
});

restartBtn.addEventListener("click", () => {
    showScreen("start");
});

splitForm.addEventListener("submit", (e) => {
    e.preventDefault();

    try {
        const formData = new FormData(splitForm);
        const analysis = analyzeRace(currentTemplate, formData);
        renderResults(currentTemplate, analysis);
        showScreen("result");
    } catch (err) {
        alert(err.message);
    }
});




initEventSelect();