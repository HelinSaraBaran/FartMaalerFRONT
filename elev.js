// This file handles student functionality.

let currentSessionId = null;
let selectedCarType = "";
let selectedRoadType = "";
let selectedSpeedLimit = 0;
let selectedScalingFactor = 0;


// Loads groups into dropdown - US8
async function loadGroupsForStudent() {

    const groupSelect =
        document.getElementById("groupSelect");

    if (groupSelect === null) {
        return;
    }

    groupSelect.innerHTML =
        "<option value=''>Indlæser grupper...</option>";

    try {

        const response =
            await axios.get(
                apiUrl + "/Groups"
            );

        const groups =
            response.data;

        groupSelect.innerHTML =
            "<option value=''>Vælg gruppe</option>";

        for (let index = 0; index < groups.length; index++) {

            const group =
                groups[index];

            const option =
                document.createElement("option");

            option.value =
                group.id;

            option.textContent =
                group.name + " - " + group.school;

            if (group.isLocked === true) {

                option.disabled =
                    true;

                option.textContent =
                    group.name + " - " + group.school + " (aktiv session)";
            }

            groupSelect.appendChild(
                option
            );
        }
    }

    catch(error) {

        console.log(error);

        groupSelect.innerHTML =
            "<option value=''>Kunne ikke hente grupper</option>";

        showError(
            "Kunne ikke hente grupper"
        );
    }
}


// Start session - US8
async function startSession() {

    clearError();

    const groupSelect =
        document.getElementById("groupSelect");

    const carTypeSelect =
        document.getElementById("carTypeSelect");

    const roadTypeSelect =
        document.getElementById("roadTypeSelect");

    if (groupSelect === null || carTypeSelect === null || roadTypeSelect === null) {
        showError("Siden mangler nødvendige felter");
        return;
    }

    if (groupSelect.value === "" || carTypeSelect.value === "" || roadTypeSelect.value === "") {
        showError("Du kan ikke starte før alle felter er udfyldt");
        return;
    }

    selectedCarType =
        carTypeSelect.value;

    setRoadValues(
        roadTypeSelect.value
    );

    if (selectedRoadType === "" || selectedSpeedLimit === 0 || selectedScalingFactor === 0) {
        showError("Vejtypen kunne ikke læses korrekt");
        return;
    }

    const newSession = {
        groupId: Number(groupSelect.value),
        carType: selectedCarType,
        roadType: selectedRoadType
    };

    try {

        const response =
            await axios.post(
                apiUrl + "/Sessions",
                newSession
            );

        localStorage.setItem(
            "sessionId",
            response.data.id
        );

        localStorage.setItem(
            "groupId",
            groupSelect.value
        );

        localStorage.setItem(
            "groupName",
            groupSelect.options[groupSelect.selectedIndex].textContent
        );

        localStorage.setItem(
            "carType",
            selectedCarType
        );

        localStorage.setItem(
            "roadType",
            selectedRoadType
        );

        localStorage.setItem(
            "speedLimit",
            selectedSpeedLimit
        );

        localStorage.setItem(
            "scalingFactor",
            selectedScalingFactor
        );

        window.location.href =
            "session.html";
    }

    catch(error) {

        console.log(error);

        if (error.response !== undefined &&
            error.response !== null &&
            error.response.data !== undefined &&
            error.response.data !== null &&
            error.response.data.message !== undefined) {

            showError(
                error.response.data.message
            );

            return;
        }

        showError(
            "Kunne ikke starte session"
        );
    }
}


// Converts selected road type to session values - US8 and US9
function setRoadValues(roadValue) {

    selectedRoadType =
        "";

    selectedSpeedLimit =
        0;

    selectedScalingFactor =
        0;

    if (roadValue === "Byzone" || roadValue === "byzone 50") {

        selectedRoadType =
            "byzone 50";

        selectedSpeedLimit =
            50;

        selectedScalingFactor =
            10;
    }

    if (roadValue === "Landevej" || roadValue === "landevej 80") {

        selectedRoadType =
            "landevej 80";

        selectedSpeedLimit =
            80;

        selectedScalingFactor =
            15;
    }

    if (roadValue === "Motorvej" || roadValue === "motorvej 130") {

        selectedRoadType =
            "motorvej 130";

        selectedSpeedLimit =
            130;

        selectedScalingFactor =
            20;
    }
}


// Loads session page display
function loadStudentSessionPage() {

    const groupDisplay =
        document.getElementById("groupDisplay");

    const carTypeDisplay =
        document.getElementById("carTypeDisplay");

    const roadTypeDisplay =
        document.getElementById("roadTypeDisplay");

    const speedLimitDisplay =
        document.getElementById("speed-limit-display");

    const limitBadge =
        document.getElementById("limit-badge");

    const groupName =
        localStorage.getItem("groupName");

    const carType =
        localStorage.getItem("carType");

    const roadType =
        localStorage.getItem("roadType");

    const speedLimit =
        localStorage.getItem("speedLimit");

    if (groupDisplay !== null) {
        groupDisplay.innerHTML =
            safeText(groupName);
    }

    if (carTypeDisplay !== null) {
        carTypeDisplay.innerHTML =
            safeText(carType);
    }

    if (roadTypeDisplay !== null) {
        roadTypeDisplay.innerHTML =
            safeText(roadType);
    }

    if (speedLimitDisplay !== null) {
        speedLimitDisplay.innerHTML =
            safeText(speedLimit);
    }

    if (limitBadge !== null) {
        limitBadge.innerHTML =
            safeText(speedLimit);
    }
}


// Create measurement - US9, US10, US11 and US12
async function createMeasurement() {

    clearError();

    currentSessionId =
        localStorage.getItem("sessionId");

    if (currentSessionId === null || currentSessionId === "") {
        showError("Ingen aktiv session");
        return;
    }

    const distance =
        1;

    const time =
        Math.random() * 0.5 + 0.2;

    const scalingFactor =
        Number(localStorage.getItem("scalingFactor"));

    const speedLimit =
        Number(localStorage.getItem("speedLimit"));

    const carType =
        localStorage.getItem("carType");

    const roadType =
        localStorage.getItem("roadType");

    if (scalingFactor === 0 || speedLimit === 0 || carType === null || roadType === null) {
        showError("Sessionens data mangler. Start en ny session.");
        return;
    }

    const measuredSpeed =
        distance / time;

    const simulatedSpeed =
        Math.round(measuredSpeed * scalingFactor);

    const co2 =
        calculateCo2(
            carType,
            simulatedSpeed
        );

    const score =
        calculateScore(
            simulatedSpeed,
            speedLimit,
            co2
        );

    const measurement = {
        sessionId: Number(currentSessionId),
        speed: simulatedSpeed,
        time: Math.round(time * 100) / 100,
        distance: distance,
        roadType: roadType,
        carType: carType,
        co2: co2,
        score: score
    };

    try {

        await axios.post(
            apiUrl + "/Measurements",
            measurement
        );

        showMeasurement(
            measurement,
            speedLimit
        );

        showCo2Feedback(
            measurement,
            speedLimit
        );

        showFunFact();
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke gemme måling"
        );
    }
}


// Calculates CO2 based on car type and speed - US11
function calculateCo2(carType, speed) {

    let baseCo2 =
        90;

    if (carType === "Benzin Lille") {
        baseCo2 = 95;
    }

    if (carType === "Benzin Stor") {
        baseCo2 = 130;
    }

    if (carType === "Diesel") {
        baseCo2 = 120;
    }

    if (carType === "Hybrid") {
        baseCo2 = 70;
    }

    return Math.round(
        baseCo2 + speed * 0.4
    );
}


// Calculates leaderboard score - US7 and US12
function calculateScore(speed, speedLimit, co2) {

    const difference =
        Math.abs(speed - speedLimit);

    return Math.round(
        difference + co2 / 10
    );
}


// Shows measurement result on session page - US9
function showMeasurement(measurement, speedLimit) {

    const speedValue =
        document.getElementById("speed-value");

    if (speedValue !== null) {
        speedValue.innerHTML = measurement.speed;
    }

    const distanceText =
        document.getElementById("distance");

    if (distanceText !== null) {
        distanceText.innerHTML = measurement.distance + " m";
    }

    const timeText =
        document.getElementById("tid");

    if (timeText !== null) {
        timeText.innerHTML = measurement.time + " sek.";
    }

    const ownSpeedText =
        document.getElementById("din-hastighed");

    if (ownSpeedText !== null) {
        ownSpeedText.innerHTML = measurement.speed + " km/t";
    }

    const deviationText =
        document.getElementById("afvigelse");

    if (deviationText !== null) {
        deviationText.innerHTML =
            Math.abs(measurement.speed - speedLimit) + " km/t";
    }

    const limitBadge =
        document.getElementById("limit-badge");

    if (limitBadge !== null) {
        limitBadge.innerHTML = speedLimit;
    }

    const formulaText =
        document.getElementById("formulaText");

    if (formulaText !== null) {
        formulaText.innerHTML =
            "Formel: hastighed = distance / tid";
    }

    showFeedback(
        measurement.speed,
        speedLimit,
        measurement.co2
    );
}


// Shows visual and spoken feedback - US10
function showFeedback(speed, speedLimit, co2) {

    const feedbackMessage =
        document.querySelector(".feedback-message");

    if (feedbackMessage === null) {
        return;
    }

    if (speed > speedLimit) {

        feedbackMessage.innerHTML =
            "😠 For hurtigt — du bruger mere brændstof end nødvendigt.";

        playBeep();

        speakText(
            "For hurtigt. Din hastighed er " + speed + " kilometer i timen. CO2 udledning er " + co2 + " gram."
        );
    }

    else if (speed < speedLimit) {

        feedbackMessage.innerHTML =
            "😐 For langsomt — prøv at komme tættere på fartgrænsen.";

        speakText(
            "For langsomt. Din hastighed er " + speed + " kilometer i timen. Prøv at komme tættere på " + speedLimit + " kilometer i timen."
        );
    }

    else {

        feedbackMessage.innerHTML =
            "🙂 Perfekt! Du ramte præcis fartgrænsen.";

        speakText(
            "Perfekt. Du ramte præcis " + speedLimit + " kilometer i timen."
        );
    }
}


// Shows CO2 text - US11
function showCo2Feedback(measurement, speedLimit) {

    const co2Text =
        document.getElementById("co2Text");

    if (co2Text === null) {
        return;
    }

    const co2AtLimit =
        calculateCo2(
            measurement.carType,
            speedLimit
        );

    const difference =
        measurement.co2 - co2AtLimit;

    if (difference > 0) {

        co2Text.innerHTML =
            "Du brugte ca. " + difference + " gram mere CO₂ end ved fartgrænsen.";
    }

    else if (difference < 0) {

        co2Text.innerHTML =
            "Du sparede ca. " + Math.abs(difference) + " gram CO₂.";
    }

    else {

        co2Text.innerHTML =
            "Du ramte fartgrænsen og holdt CO₂-forbruget stabilt.";
    }
}


// Beep placeholder - US10
function playBeep() {

    console.log(
        "Bip lyd"
    );
}


// Text to speech - US10
function speakText(text) {

    if ("speechSynthesis" in window === false) {
        return;
    }

    const speech =
        new SpeechSynthesisUtterance(text);

    speech.lang =
        "da-DK";

    window.speechSynthesis.speak(
        speech
    );
}


// End session - US14
async function endSession() {

    clearError();

    currentSessionId =
        localStorage.getItem("sessionId");

    if (currentSessionId === null || currentSessionId === "") {
        showError("Ingen aktiv session");
        return;
    }

    try {

        await axios.put(
            apiUrl + "/Sessions/" + currentSessionId + "/end",
            null
        );

        window.location.href =
            "opsummering.html";
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke afslutte session"
        );
    }
}


// History - US13
async function loadHistory() {

    const historyBody =
        document.getElementById("historyBody");

    if (historyBody === null) {
        return;
    }

    clearError();

    const roadTypeFilter =
        document.getElementById("historyRoadTypeFilter");

    const carTypeFilter =
        document.getElementById("historyCarTypeFilter");

    const dateFilter =
        document.getElementById("historyDateFilter");

    try {

        const response =
            await axios.get(
                apiUrl + "/Sessions"
            );

        const sessions =
            response.data;

        historyBody.innerHTML =
            "";

        let shownCount =
            0;

        let bestScore =
            null;

        let bestSession =
            null;

        for (let index = 0; index < sessions.length; index++) {

            const session =
                sessions[index];

            let shouldShow =
                true;

            if (roadTypeFilter !== null && roadTypeFilter.value !== "" && session.roadType !== roadTypeFilter.value) {
                shouldShow = false;
            }

            if (carTypeFilter !== null && carTypeFilter.value !== "" && session.carType !== carTypeFilter.value) {
                shouldShow = false;
            }

            if (dateFilter !== null && dateFilter.value !== "" && session.createdAt !== undefined && session.createdAt !== null) {

                if (session.createdAt.substring(0, 10) !== dateFilter.value) {
                    shouldShow = false;
                }
            }

            if (shouldShow === true) {

                shownCount =
                    shownCount + 1;

                historyBody.innerHTML +=
                    "<tr>" +
                        "<td>" + formatDate(session.createdAt) + "</td>" +
                        "<td>" + formatTime(session.createdAt) + "</td>" +
                        "<td>" + safeText(session.roadType) + "</td>" +
                        "<td>" + safeText(session.carType) + "</td>" +
                        "<td>" + safeText(session.status) + "</td>" +
                        "<td><button type='button' class='details-btn'>👁️</button></td>" +
                    "</tr>";

                if (session.score !== undefined && session.score !== null) {

                    if (bestScore === null || session.score < bestScore) {
                        bestScore = session.score;
                        bestSession = session;
                    }
                }
            }
        }

        if (shownCount === 0) {
            historyBody.innerHTML =
                "<tr><td colspan='6'>Ingen sessioner fundet</td></tr>";
        }

        updateHistoryText(
            shownCount,
            bestScore,
            bestSession
        );
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke hente historik"
        );
    }
}


// Resets filters - US13
function resetHistoryFilters() {

    const roadTypeFilter =
        document.getElementById("historyRoadTypeFilter");

    const carTypeFilter =
        document.getElementById("historyCarTypeFilter");

    const dateFilter =
        document.getElementById("historyDateFilter");

    if (roadTypeFilter !== null) {
        roadTypeFilter.value = "";
    }

    if (carTypeFilter !== null) {
        carTypeFilter.value = "";
    }

    if (dateFilter !== null) {
        dateFilter.value = "";
    }

    loadHistory();
}


// Updates history text - US13
function updateHistoryText(count, bestScore, bestSession) {

    const historyTitle =
        document.getElementById("historyTitle");

    const historyFooter =
        document.getElementById("historyFooter");

    const bestScoreText =
        document.getElementById("bestScoreText");

    const bestSessionTitle =
        document.getElementById("bestSessionTitle");

    const bestSessionRoad =
        document.getElementById("bestSessionRoad");

    const bestSessionCar =
        document.getElementById("bestSessionCar");

    if (historyTitle !== null) {
        historyTitle.innerHTML =
            "Dine sessioner (" + count + ")";
    }

    if (historyFooter !== null) {
        historyFooter.innerHTML =
            "Viser " + count + " sessioner";
    }

    if (bestScoreText !== null) {

        if (bestScore === null) {
            bestScoreText.innerHTML = "---";
        }
        else {
            bestScoreText.innerHTML = bestScore;
        }
    }

    if (bestSessionTitle !== null) {

        if (bestSession === null) {
            bestSessionTitle.innerHTML =
                "Ingen bedste session endnu";
        }
        else {
            bestSessionTitle.innerHTML =
                "Bedste session";
        }
    }

    if (bestSessionRoad !== null) {

        if (bestSession === null) {
            bestSessionRoad.innerHTML =
                "---";
        }
        else {
            bestSessionRoad.innerHTML =
                bestSession.roadType;
        }
    }

    if (bestSessionCar !== null) {

        if (bestSession === null) {
            bestSessionCar.innerHTML =
                "---";
        }
        else {
            bestSessionCar.innerHTML =
                bestSession.carType;
        }
    }
}


// Formats date
function formatDate(dateText) {

    if (dateText === undefined || dateText === null) {
        return "---";
    }

    return dateText.substring(
        0,
        10
    );
}


// Formats time
function formatTime(dateText) {

    if (dateText === undefined || dateText === null || dateText.length < 16) {
        return "---";
    }

    return dateText.substring(
        11,
        16
    );
}


// Prevents undefined text
function safeText(text) {

    if (text === undefined || text === null || text === "") {
        return "---";
    }

    return text;
}


// Fun fact - US15
function showFunFact() {

    const popup =
        document.getElementById("funfact-popup");

    if (popup === null) {
        return;
    }

    popup.style.display =
        "block";

    setTimeout(function() {

        popup.style.display =
            "none";

    }, 5000);
}


// Page load
window.addEventListener("load", function() {

    loadGroupsForStudent();

    const nextButton =
        document.querySelector(".next-button");

    if (nextButton !== null) {

        nextButton.addEventListener("click", function() {
            createMeasurement();
        });
    }

    const endSessionButton =
        document.querySelector(".end-session-button");

    if (endSessionButton !== null) {

        endSessionButton.addEventListener("click", function() {
            endSession();
        });
    }

    const roadTypeFilter =
        document.getElementById("historyRoadTypeFilter");

    if (roadTypeFilter !== null) {

        roadTypeFilter.addEventListener("change", function() {
            loadHistory();
        });
    }

    const carTypeFilter =
        document.getElementById("historyCarTypeFilter");

    if (carTypeFilter !== null) {

        carTypeFilter.addEventListener("change", function() {
            loadHistory();
        });
    }

    const dateFilter =
        document.getElementById("historyDateFilter");

    if (dateFilter !== null) {

        dateFilter.addEventListener("change", function() {
            loadHistory();
        });
    }

    loadHistory();
});