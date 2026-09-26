let lastAnalysisResult = null;
let lastAnalysisTemplate = null;

//chart:
let speedChart = null;

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

    // Im
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

    if (timeString.includes(":")) {
        const parts = timeString.split(":");

        if (parts.length !== 2) return NaN;

        const minutes = Number(parts[0]);
        const seconds = Number(parts[1]);

        if (Number.isNaN(minutes) || Number.isNaN(seconds)) return NaN;

        return minutes * 60 + seconds;
    }

    return Number(timeString);
}

// EQUAL SPLIT DISTRIBUTION
function createSplitDistribution(result) {

    const totalDistance = result.totalDistance;
    const totalTime = result.totalTime;

    let splitDistance;


    if (totalDistance <= 50) {
        splitDistance = 25;
    } else if (totalDistance <= 200) {
        splitDistance = 50;
    } else {
        splitDistance = 100;
    }


    const splitCount = totalDistance / splitDistance;


    const rows = [];


    for (let i = 0; i < splitCount; i++) {

        const start = i * splitDistance;
        const end = (i + 1) * splitDistance;

        let startTime = 0;
        let endTime = 0;


        if (start === 0) {
            startTime = 0;
        } else {
            const startCheckpoint = result.checkpointData.find(
                cp => cp.distance === start
            );

            startTime = startCheckpoint?.time || 0;
        }


        const endCheckpoint = result.checkpointData.find(
            cp => cp.distance === end
        );


        endTime = endCheckpoint?.time || 0;


        const splitTime = endTime - startTime;


        const percentage =
            (splitTime / totalTime) * 100;


        rows.push([
            `${start}-${end} m`,
            `${formatTime(splitTime)}`,
            `${percentage.toFixed(2)} %`
        ]);

    }

    return rows;

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

    const poolField = document.createElement("div");
    poolField.className = "field";

    const poolLabel = document.createElement("label");
    poolLabel.textContent = "Length";

    const poolSelect = document.createElement("select");
    poolSelect.id = "poolType";
    poolSelect.name = "poolType";

    ["SCM", "LCM"].forEach(type => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        poolSelect.appendChild(option);
    });

    poolField.appendChild(poolLabel);
    poolField.appendChild(poolSelect);

    splitForm.appendChild(poolField);

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

    const breathField = document.createElement("div");
    breathField.className = "field";

    const breathLabel = document.createElement("label");
    breathLabel.setAttribute("for", "breathCount");
    breathLabel.textContent = "Breath count (optional)";

    const breathInput = document.createElement("input");
    breathInput.type = "text";
    breathInput.id = "breathCount";
    breathInput.name = "breathCount";
    breathInput.placeholder = "optional";

    breathField.appendChild(breathLabel);
    breathField.appendChild(breathInput);
    splitForm.appendChild(breathField);
}

// ------------------------------------------------------------
// ANALYSIS
// ------------------------------------------------------------
function analyzeRace(template, formData) {
    const poolType = formData.get("poolType");
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
    const strokeCount = strokeCountRaw === null || strokeCountRaw === ""
        ? null
        : String(strokeCountRaw).trim();

    const breathCountRaw = formData.get("breathCount");

    const breathCount = breathCountRaw === null || breathCountRaw === ""
        ? null
        : String(breathCountRaw).trim();

    const filledPoints = checkpointData.filter(
        cp => cp.time !== null && !Number.isNaN(cp.time) && cp.time > 0
    );

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

    // SWOLF = Stroke Count + Time in seconds
    const swolf = strokeCount !== null && strokeCount !== ""
        ? Number(strokeCount) + totalTime
        : null;

    const avgSpeed = calcAverageSpeed(totalDistance, totalTime);

    const sections = calcSectionTimesFromFilledPoints(filledPoints);
    const sectionSpeeds = sections.map(s => s.speed);

    const startSpeed = sectionSpeeds[0];
    const lastSpeed = sectionSpeeds[sectionSpeeds.length - 1];
    const speedLossPercent = sectionSpeeds.length > 1 ? calcSpeedLossPercent(startSpeed, lastSpeed) : 0;

    const fastestSection = sections.reduce((best, current) => current.speed > best.speed ? current : best, sections[0]);
    const slowestSection = sections.reduce((worst, current) => current.speed < worst.speed ? current : worst, sections[0]);

    return {
        poolType,
        swimmerName,
        raceDate,
        totalDistance,
        totalTime,
        avgSpeed,
        sections,
        checkpointData,
        strokeCount,
        swolf,
        breathCount,
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

// CREATE SPEED CHART
function renderSpeedChart(result) {

    const ctx = document
        .getElementById("speedChart")
        .getContext("2d");

    let currentDistance = 0;

    const splitPoints = result.sections.map(section => {

        currentDistance += section.distance;

        return {
            x: currentDistance,
            y: section.speed
        };

    });


    const points = [

        {
            x: 0,
            y: result.startSpeed
        },

        ...splitPoints

    ];


    if (speedChart) {
        speedChart.destroy();
    }


    speedChart = new Chart(ctx, {

        type: "line",

        data: {

            datasets: [{

                label: "Speed (m/s)",

                data: points,

                tension: 0.2,

                pointRadius: 4

            }]

        },


        options: {

            responsive: true,


            scales: {

                x: {

                    type: "linear",

                    min: 0,

                    max: result.totalDistance,


                    title: {

                        display: true,

                        text: "Distance (m)"

                    },


                    ticks: {

                        callback: function (value) {

                            const validDistances = points.map(point => point.x);

                            if (validDistances.includes(value)) {
                                return value + " m";
                            }

                            return "";

                        }

                    }

                },


                y: {

                    title: {

                        display: true,

                        text: "Speed (m/s)"

                    }

                }

            },


            plugins: {

                legend: {

                    display: true

                }

            }

        }

    });

}

// ------------------------------------------------------------
// SHOW RESULTS
// ------------------------------------------------------------
function renderResults(template, result) {
    lastAnalysisResult = result;
    lastAnalysisTemplate = template;

    const dateText = formatDateEuropean(result.raceDate);
    document.getElementById("nameFieldLabel").textContent = `Athlete: ${result.swimmerName || "Unknown"}`;

    document.getElementById("resultMeta").textContent = `${template.name} • ${result.poolType} • ${dateText}`;

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

    renderSpeedChart(result);

    const sectionRows = result.sections.map(section => [
        section.label,
        `${section.distance.toFixed(0)} m`,
        `${formatTime(section.time)}`,
        formatSpeed(section.speed)
    ]);

    document.getElementById("sectionTable").innerHTML = buildTable(
        ["Segment", "Distance", "Split", "v"],
        sectionRows
    );

    const summaryRows = [
        ["Course", result.poolType],
        ["Total distance", `${result.totalDistance.toFixed(0)} m`],
        ["End time", formatTime(result.totalTime)],
        ["v avg.", formatSpeed(result.avgSpeed)],
        ["v fastest seg.", `${result.fastestSection.label} (${formatSpeed(result.fastestSection.speed)})`],
        ["v slowest seg.", `${result.slowestSection.label} (${formatSpeed(result.slowestSection.speed)})`],
        ["Stroke count", result.strokeCount === null ? "---" : String(result.strokeCount)],
        ["SWOLF", result.strokeCount === null || result.strokeCount === "" ? "---" : String(result.swolf.toFixed(1))],
        ["Breath count", result.breathCount === null || result.breathCount === "" ? "---" : String(result.breathCount)],
    ];

    document.getElementById("summaryTable").innerHTML = buildTable(
        ["Index", "Value"],
        summaryRows
    );


    const splitDistribution = createSplitDistribution(result);

    if (splitDistribution.length > 0) {

        document.getElementById("splitDistributionContainer").style.display = "block";

        document.getElementById("splitDistributionTable").innerHTML = buildTable(
            ["Distance", "Time", "Percentage"],
            splitDistribution
        );

    }

    const rawRows = result.checkpointData
        .filter(cp => cp.time !== null && !Number.isNaN(cp.time) && cp.time > 0)
        .map(cp => [
            `${cp.distance} m`,
            formatTime(cp.time)
        ]);

    rawRows.push(["Stroke count", result.strokeCount === null || result.strokeCount === "" ? "---" : result.strokeCount]);
    rawRows.push(["Breath count", result.breathCount === null || result.breathCount === "" ? "---" : result.breathCount]);

    document.getElementById("rawTable").innerHTML = buildTable(["Input", "Value"], rawRows);
}

// ------------------------------------------------------------
// SAVE RESULTS
// ------------------------------------------------------------
function createPDF() {

    const { jsPDF } = window.jspdf;

    const doc = new jsPDF();

    let y = 20;

    function addPDFTitle(text) {

        if (y > 270) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(13);
        doc.text(text, 14, y);

        y += 6;

    }

    if (!lastAnalysisResult || !lastAnalysisTemplate) {
        alert("No analysis available.");
        return;
    }

    const result = lastAnalysisResult;
    const template = lastAnalysisTemplate;

    doc.setFontSize(18);
    doc.text("RaceAnalysis | Results", 14, y);

    y += 12;
    doc.setFontSize(12);

    const dateText = formatDateEuropean(result.raceDate);

    doc.setFontSize(9);
    doc.text("RaceAnalysis v1.3.1", 196, 12, {
        align: "right"
    });

    doc.setFontSize(12);

    const headerInfo = [
        `Athlete: ${result.swimmerName || "Unknown"}`,
        `Event: ${template.name}`,
        `Date: ${dateText}`,
        `Course: ${result.poolType}`
    ];


    headerInfo.forEach(line => {
        doc.text(line, 14, y);
        y += 7;
    });


    y += 8;

    // chart
    const canvas = document.getElementById("speedChart");

    if (canvas) {

        const pdfCanvas = document.createElement("canvas");

        pdfCanvas.width = 1000;
        pdfCanvas.height = 450;


        const pdfCtx = pdfCanvas.getContext("2d");


        const pdfChart = new Chart(pdfCtx, {

            type: "line",

            data: speedChart.data,

            options: {

                responsive: false,

                animation: false,

                scales: {

                    x: {
                        type: "linear",
                        min: 0,
                        max: result.totalDistance,

                        title: {
                            display: true,
                            text: "Distance (m)"
                        }
                    },

                    y: {

                        title: {
                            display: true,
                            text: "Speed (m/s)"
                        }

                    }

                },

                plugins: {

                    legend: {
                        display: true
                    }

                }

            }

        });


        const chartImage = pdfCanvas.toDataURL("image/png");


        pdfChart.destroy();


        if (y > 220) {
            doc.addPage();
            y = 20;
        }

        addPDFTitle("Speed profile");

        doc.addImage(
            chartImage,
            "PNG",
            14,
            y,
            180,
            85
        );


        y += 90;

    }

    addPDFTitle("Short overview");
    const summaryText = sectionComparisonText(result.speedLossPercent);
    const overviewData = [

        ["End time", formatTime(result.totalTime)],

        ["v avg.", formatSpeed(result.avgSpeed)],

        ["v first seg.", formatSpeed(result.startSpeed)],

        ["v last seg.", formatSpeed(result.lastSpeed)],

        ["Speed loss", `${result.speedLossPercent.toFixed(2)} %`],

        ["Evaluation", summaryText]

    ];


    doc.autoTable({

        startY: y,

        head: [
            ["Index", "Value"]
        ],

        body: overviewData

    });


    y = doc.lastAutoTable.finalY + 10;

    const splitData = result.sections.map(section => [

        section.label,

        `${section.distance.toFixed(0)} m`,

        `${formatTime(section.time)} s`,

        formatSpeed(section.speed)

    ]);

    addPDFTitle("Splits");
    doc.autoTable({

        startY: y,

        head: [
            ["Segment", "Distance", "Split", "v"]
        ],

        body: splitData

    });

    y = doc.lastAutoTable.finalY + 10;


    const overallData = [

        ["Course", result.poolType],
        ["Total distance", `${result.totalDistance.toFixed(0)} m`],
        ["End time", formatTime(result.totalTime)],
        ["v avg.", formatSpeed(result.avgSpeed)],
        ["v fastest seg.", `${result.fastestSection.label} (${formatSpeed(result.fastestSection.speed)})`],
        ["v slowest seg.", `${result.slowestSection.label} (${formatSpeed(result.slowestSection.speed)})`],
        ["Stroke count", result.strokeCount === null ? "---" : String(result.strokeCount)],
        ["SWOLF", result.strokeCount === null || result.strokeCount === "" ? "---" : String(result.swolf.toFixed(1))],
        ["Breath count", result.breathCount === null || result.breathCount === "" ? "---" : String(result.breathCount)]

    ];

    addPDFTitle("Overall data");
    doc.autoTable({

        startY: y,

        head: [
            ["Index", "Value"]
        ],

        body: overallData

    });

    y = doc.lastAutoTable.finalY + 10;

    const splitDistribution = createSplitDistribution(result);


    if (splitDistribution.length > 0) {
        addPDFTitle("Split Distribution");

        doc.autoTable({

            startY: y,

            head: [
                [
                    "Distance",
                    "Time",
                    "Percentage"
                ]
            ],

            body: splitDistribution

        });


        y = doc.lastAutoTable.finalY + 10;

    }

    const rawData = result.checkpointData
        .filter(cp =>
            cp.time !== null &&
            !Number.isNaN(cp.time) &&
            cp.time > 0
        )
        .map(cp => [
            `${cp.distance} m`,
            formatTime(cp.time)
        ]);

    rawData.push([
        "Stroke count",
        result.strokeCount === null ||
            result.strokeCount === ""
            ? "---"
            : result.strokeCount
    ]);

    rawData.push([
        "Breath count",
        result.breathCount === null ||
        result.breathCount === ""
            ? "---"
            : result.breathCount
    ]);

    addPDFTitle("Raw data");
    doc.autoTable({
        startY: y,
        theme: "grid",
        head: [
            ["Input", "Value"]
        ],
        body: rawData
    });


    const cleanName = (result.swimmerName || "Athlete").replace(/[^a-zA-Z0-9_-]/g, "_");
    const cleanEvent = (template.name || "Event").replace(/[^a-zA-Z0-9_-]/g, "");
    const cleanDate = dateText.replace(/\./g, "-");

    const filename = `RA_${cleanName}_${cleanEvent}_${cleanDate}.pdf`;

    doc.save(filename);

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

document.getElementById("downloadPdf")
    .addEventListener("click", createPDF);

// service worker
if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/sw.js");
}