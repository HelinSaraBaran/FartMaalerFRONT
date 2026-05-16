// Denne fil håndterer underviser funktioner.

let selectedLeaderboardType = "schools";
let selectedLeaderboardRoadType = "Byzone";

let teacherActionIsRunning = false;


// Underviser login - US1
async function loginTeacher() {

    clearError();

    const usernameInput =
        document.getElementById("usernameInput");

    const passwordInput =
        document.getElementById("passwordInput");

    if (usernameInput === null || passwordInput === null) {
        return;
    }

    const username =
        usernameInput.value;

    const password =
        passwordInput.value;

    if (username === "" || password === "") {

        showError(
            "Udfyld brugernavn og adgangskode"
        );

        return;
    }

    const loginData = {
        username: username,
        password: password
    };

    try {

        const response =
            await axios.post(
                apiUrl + "/Auth/login",
                loginData
            );

        if (response.data.token === undefined || response.data.token === null || response.data.token === "") {

            showError(
                "Login lykkedes ikke. Token mangler."
            );

            return;
        }

        saveToken(
            response.data.token
        );

        window.location.href =
            "overblik.html";
    }

    catch(error) {

        console.log(error);

        showError(
            "Forkert login eller API fejl"
        );
    }
}


// Logger underviser ud - US1
function logoutTeacher() {

    logout();
}


// Henter grupper - US4 og US5
async function loadGroups() {

    const groupTableBody =
        document.getElementById("groupTableBody");

    if (groupTableBody === null) {
        return;
    }

    clearError();

    groupTableBody.innerHTML =
        "<tr><td colspan='6'>Indlæser grupper...</td></tr>";

    try {

        const response =
            await axios.get(
                apiUrl + "/Groups"
            );

        let groups =
            response.data;

        if (groups === undefined || groups === null) {

            groupTableBody.innerHTML =
                "<tr><td colspan='6'>Ingen grupper fundet</td></tr>";

            return;
        }

        if (groups.$values !== undefined && groups.$values !== null) {

            groups =
                groups.$values;
        }

        groupTableBody.innerHTML =
            "";

        if (groups.length === 0) {

            groupTableBody.innerHTML =
                "<tr><td colspan='6'>Ingen grupper endnu</td></tr>";

            return;
        }

        for (let index = 0; index < groups.length; index++) {

            const group =
                groups[index];

            groupTableBody.innerHTML +=
                "<tr>" +
                    "<td>" + getValue(group.id) + "</td>" +
                    "<td>" + getValue(group.name) + "</td>" +
                    "<td>" + getValue(group.school) + "</td>" +
                    "<td>Aktiv</td>" +
                    "<td>---</td>" +
                    "<td class='actions' style='text-align:right;'>" +
                        "<button type='button' class='edit-btn' onclick='editGroup(" + group.id + ")'>Rediger</button>" +
                        "<button type='button' class='delete-btn-sm' onclick='deleteGroup(" + group.id + ")'>Slet</button>" +
                    "</td>" +
                "</tr>";
        }
    }

    catch(error) {

        console.log(error);

        groupTableBody.innerHTML =
            "<tr><td colspan='6'>Kunne ikke hente grupper</td></tr>";

        showError(
            "Kunne ikke hente grupper fra API"
        );
    }
}


// Opretter gruppe - US4
async function createGroup() {

    clearError();

    const groupNameInput =
        document.getElementById("groupNameInput");

    if (groupNameInput === null) {
        return;
    }

    const groupName =
        groupNameInput.value.trim();

    if (groupName === "") {

        showError(
            "Skriv gruppenavn"
        );

        return;
    }

    const newGroup = {
        name: groupName,
        school: "Roskilde Skole",
        isLocked: false
    };

    try {

        await axios.post(
            apiUrl + "/Groups",
            newGroup
        );

        groupNameInput.value =
            "";

        await loadGroups();
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke oprette gruppe. Tjek Console eller Network."
        );
    }
}


// Redigerer gruppe - US5
async function editGroup(id) {

    clearError();

    const newName =
        prompt("Skriv nyt gruppenavn:");

    if (newName === null || newName === "") {
        return;
    }

    const newSchool =
        prompt("Skriv skolenavn:");

    let schoolName =
        "Roskilde Skole";

    if (newSchool !== null && newSchool !== "") {
        schoolName = newSchool;
    }

    const updatedGroup = {
        id: id,
        name: newName,
        school: schoolName,
        isLocked: false
    };

    try {

        await axios.put(
            apiUrl + "/Groups/" + id,
            updatedGroup
        );

        await loadGroups();
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke redigere gruppe"
        );
    }
}


// Sletter gruppe - US5
async function deleteGroup(id) {

    clearError();

    const confirmed =
        confirm("Er du sikker på, at du vil slette gruppen og dens sessions?");

    if (confirmed === false) {
        return;
    }

    try {

        await axios.delete(
            apiUrl + "/Groups/" + id
        );

        await loadGroups();
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke slette gruppe"
        );
    }
}


// Henter indstillinger - US2
async function loadSettings() {

    const masterToggle =
        document.getElementById("masterToggle");

    if (masterToggle === null) {
        return;
    }

    clearError();

    try {

        const response =
            await axios.get(
                apiUrl + "/Settings"
            );

        let settings =
            response.data;

        if (settings.$values !== undefined && settings.$values !== null) {

            settings =
                settings.$values;
        }

        let enabledCount =
            0;

        for (let index = 0; index < settings.length; index++) {

            const setting =
                settings[index];

            if (setting.value === true) {
                enabledCount = enabledCount + 1;
            }

            if (setting.key !== undefined &&
                setting.key !== null &&
                setting.key.toLowerCase() === "tts") {

                setChecked("ttsToggle", setting.value);
            }

            if (setting.key !== undefined &&
                setting.key !== null &&
                setting.key.toLowerCase() === "beep") {

                setChecked("beepToggle", setting.value);
            }

            if (setting.key !== undefined &&
                setting.key !== null &&
                setting.key.toLowerCase() === "funfacts") {

                setChecked("funFactsToggle", setting.value);
            }

            if (setting.key !== undefined &&
                setting.key !== null &&
                setting.key.toLowerCase() === "leaderboard") {

                setChecked("leaderboardToggle", setting.value);
            }

            if (setting.key !== undefined &&
                setting.key !== null &&
                setting.key.toLowerCase() === "visualfeedback") {

                setChecked("visualFeedbackToggle", setting.value);
            }
        }

        if (enabledCount === settings.length && settings.length > 0) {
            masterToggle.checked = true;
        }
        else {
            masterToggle.checked = false;
        }
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke hente indstillinger"
        );
    }
}


// Opdaterer en indstilling - US2
async function updateSetting(key, value) {

    clearError();

    const settingData = {
        key: key,
        value: value
    };

    try {

        await axios.put(
            apiUrl + "/Settings/" + key,
            settingData
        );
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke gemme indstilling"
        );
    }
}


// Opdaterer alle indstillinger - US2
function updateAllSettings() {

    const masterToggle =
        document.getElementById("masterToggle");

    if (masterToggle === null) {
        return;
    }

    const isChecked =
        masterToggle.checked;

    setChecked("ttsToggle", isChecked);
    setChecked("beepToggle", isChecked);
    setChecked("funFactsToggle", isChecked);
    setChecked("leaderboardToggle", isChecked);
    setChecked("visualFeedbackToggle", isChecked);

    updateSetting("tts", isChecked);
    updateSetting("beep", isChecked);
    updateSetting("funfacts", isChecked);
    updateSetting("leaderboard", isChecked);
    updateSetting("visualfeedback", isChecked);
}


// Henter underviser overblik - US6
async function loadTeacherOverview() {

    await loadOverview();

    setInterval(function() {
        loadOverview();
    }, 5000);
}


// Henter overblik og live målinger - US6
async function loadOverview() {

    const latestMeasurementsBody =
        document.getElementById("latestMeasurementsBody");

    if (latestMeasurementsBody === null) {
        return;
    }

    clearError();

    try {

        const response =
            await axios.get(
                apiUrl + "/Measurements"
            );

        let measurements =
            response.data;

        if (measurements.$values !== undefined && measurements.$values !== null) {

            measurements =
                measurements.$values;
        }

        let totalSpeed =
            0;

        let totalCo2 =
            0;

        let totalScore =
            0;

        latestMeasurementsBody.innerHTML =
            "";

        if (measurements.length === 0) {

            latestMeasurementsBody.innerHTML =
                "<tr><td colspan='4'>Venter på måling...</td></tr>";

            setOverviewNumbers(
                0,
                0,
                0,
                0
            );

            return;
        }

        for (let index = 0; index < measurements.length; index++) {

            const measurement =
                measurements[index];

            const speed =
                getNumber(measurement.speed);

            const co2 =
                getNumber(measurement.co2);

            const score =
                getNumber(measurement.score);

            totalSpeed =
                totalSpeed + speed;

            totalCo2 =
                totalCo2 + co2;

            totalScore =
                totalScore + score;

            latestMeasurementsBody.innerHTML +=
                "<tr>" +
                    "<td>Gruppe " + getValue(measurement.groupId) + "</td>" +
                    "<td>" + speed + " km/t</td>" +
                    "<td>" + co2 + " g</td>" +
                    "<td><span class='status green'>Målt</span></td>" +
                "</tr>";
        }

        setOverviewNumbers(
            Math.round(totalSpeed / measurements.length),
            Math.round(totalCo2 / measurements.length),
            Math.round(totalScore / measurements.length),
            measurements.length
        );
    }

    catch(error) {

        console.log(error);

        latestMeasurementsBody.innerHTML =
            "<tr><td colspan='4'>Kunne ikke hente målinger</td></tr>";
    }
}


// Sætter tal på overblik siden - US6
function setOverviewNumbers(averageSpeed, averageCo2, averageScore, count) {

    setText(
        "averageSpeedText",
        averageSpeed + " km/t"
    );

    setText(
        "averageCo2Text",
        averageCo2 + " g"
    );

    setText(
        "averageScoreText",
        averageScore
    );

    setText(
        "measurementCountText",
        count
    );

    setText(
        "classScoreText",
        averageScore
    );
}


// Henter underviser måle side - US3, US6, US12, US13 og US14
async function loadTeacherMeasurements() {

    await loadGroupsCount();
    await loadSessions();
    await loadOverview();
}


// Henter antal grupper - US3
async function loadGroupsCount() {

    const groupCountText =
        document.getElementById("groupCountText");

    if (groupCountText === null) {
        return;
    }

    try {

        const response =
            await axios.get(
                apiUrl + "/Groups"
            );

        let groups =
            response.data;

        if (groups.$values !== undefined && groups.$values !== null) {

            groups =
                groups.$values;
        }

        setText(
            "groupCountText",
            groups.length
        );
    }

    catch(error) {

        console.log(error);

        setText(
            "groupCountText",
            "---"
        );
    }
}


// Henter sessions til maaling siden - US3 og US14
async function loadSessions() {

    const sessionsTableBody =
        document.getElementById("sessionsTableBody");

    if (sessionsTableBody === null) {
        return;
    }

    clearError();

    try {

        const response =
            await axios.get(
                apiUrl + "/Sessions"
            );

        let sessions =
            response.data;

        if (sessions.$values !== undefined && sessions.$values !== null) {

            sessions =
                sessions.$values;
        }

        sessionsTableBody.innerHTML =
            "";

        if (sessions.length === 0) {

            sessionsTableBody.innerHTML =
                "<tr><td colspan='8'>Ingen sessions endnu</td></tr>";

            setText(
                "sessionCountText",
                0
            );

            return;
        }

        for (let index = 0; index < sessions.length; index++) {

            const session =
                sessions[index];

            let endButton =
                "";

            if (session.status === "Ended") {

                endButton =
                    "<span class='status green'>Afsluttet</span>";
            }
            else {

                endButton =
                    "<button type='button' class='edit-btn' onclick='endSession(" + session.id + ")'>Afslut</button>";
            }

            sessionsTableBody.innerHTML +=
                "<tr>" +
                    "<td>Gruppe " + getValue(session.groupId) + "</td>" +
                    "<td>" + getValue(session.carType) + "</td>" +
                    "<td>" + getValue(session.roadType) + "</td>" +
                    "<td>" + getValue(session.speedLimit) + " km/t</td>" +
                    "<td>" + getValue(session.status) + "</td>" +
                    "<td>" + formatDateTime(session.createdAt) + "</td>" +
                    "<td>" + endButton + "</td>" +
                    "<td><button type='button' class='delete-btn-sm' onclick='deleteSession(" + session.id + ")'>Slet</button></td>" +
                "</tr>";
        }

        setText(
            "sessionCountText",
            sessions.length
        );
    }

    catch(error) {

        console.log(error);

        sessionsTableBody.innerHTML =
            "<tr><td colspan='8'>Kunne ikke hente sessions</td></tr>";
    }
}


// Afslutter session - US14
async function endSession(id) {

    clearError();

    const confirmed =
        confirm("Er du sikker på, at du vil afslutte denne session?");

    if (confirmed === false) {
        return;
    }

    try {

        const token =
            localStorage.getItem("token");

        await axios.put(
            apiUrl + "/Sessions/" + id + "/end",
            {},
            {
                headers:
                {
                    Authorization: "Bearer " + token
                }
            }
        );

        await loadSessions();
        await loadOverview();
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke afslutte session"
        );
    }
}


// Sletter session - US3
async function deleteSession(id) {

    clearError();

    const confirmed =
        confirm("Er du sikker på, at du vil slette denne session?");

    if (confirmed === false) {
        return;
    }

    try {

        await axios.delete(
            apiUrl + "/Sessions/" + id
        );

        await loadSessions();
        await loadOverview();
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke slette session"
        );
    }
}


// Sletter al historik - US3
async function deleteAllHistory() {

    clearError();

    const confirmed =
        confirm("Er du sikker på, at du vil slette al historik?");

    if (confirmed === false) {
        return;
    }

    try {

        await axios.delete(
            apiUrl + "/Sessions/all"
        );

        await loadSessions();
        await loadOverview();
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke slette al historik. Tjek om backend har endpoint til dette."
        );
    }
}


// Sletter alle grupper - US5
async function deleteAllGroups() {

    clearError();

    const confirmed =
        confirm("Er du sikker på, at du vil slette alle grupper?");

    if (confirmed === false) {
        return;
    }

    try {

        await axios.delete(
            apiUrl + "/Groups"
        );

        await loadGroups();
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke slette alle grupper. Tjek om backend har endpoint til dette."
        );
    }
}


// Henter underviser leaderboard - US7
async function loadTeacherLeaderboard() {

    await loadLeaderboard();
}


// Skifter leaderboard type - US7
function changeLeaderboardType(type) {

    selectedLeaderboardType =
        type;

    setTabActive(
        "schoolLeaderboardTab",
        type === "schools"
    );

    setTabActive(
        "classLeaderboardTab",
        type === "classes"
    );

    loadLeaderboard();
}


// Skifter leaderboard vejtype - US7
function changeLeaderboardRoadType(roadType) {

    selectedLeaderboardRoadType =
        roadType;

    setTabActive(
        "byzoneTab",
        roadType === "Byzone"
    );

    setTabActive(
        "landevejTab",
        roadType === "Landevej"
    );

    setTabActive(
        "motorvejTab",
        roadType === "Motorvej"
    );

    loadLeaderboard();
}


// Henter leaderboard - US7
async function loadLeaderboard() {

    const leaderboardBody =
        document.getElementById("leaderboardBody");

    if (leaderboardBody === null) {
        return;
    }

    clearError();

    try {

        let endpoint =
            apiUrl + "/Leaderboard";

        if (selectedLeaderboardType === "schools") {
            endpoint = apiUrl + "/Leaderboard/schools?roadType=" + selectedLeaderboardRoadType;
        }

        if (selectedLeaderboardType === "classes") {
            endpoint = apiUrl + "/Leaderboard/classes?roadType=" + selectedLeaderboardRoadType;
        }

        const response =
            await axios.get(
                endpoint
            );

        let leaderboard =
            response.data;

        if (leaderboard.$values !== undefined && leaderboard.$values !== null) {

            leaderboard =
                leaderboard.$values;
        }

        leaderboardBody.innerHTML =
            "";

        if (leaderboard.length === 0) {

            leaderboardBody.innerHTML =
                "<tr><td colspan='5'>Ingen leaderboard-data endnu</td></tr>";

            updateTopThree(
                leaderboard
            );

            return;
        }

        for (let index = 0; index < leaderboard.length; index++) {

            const item =
                leaderboard[index];

            const name =
                getLeaderboardName(item);

            const averageCo2 =
                getLeaderboardValue(
                    item.averageCo2,
                    item.avgCo2,
                    item.co2,
                    item.totalCo2
                );

            const measurementCount =
                getLeaderboardValue(
                    item.measurementCount,
                    item.count,
                    item.numberOfMeasurements,
                    item.measurementsCount
                );

            const score =
                getLeaderboardValue(
                    item.score,
                    item.averageScore,
                    item.bestScore,
                    item.totalScore
                );

            leaderboardBody.innerHTML +=
                "<tr>" +
                    "<td>" + (index + 1) + "</td>" +
                    "<td>" + name + "</td>" +
                    "<td>" + averageCo2 + " g</td>" +
                    "<td>" + measurementCount + "</td>" +
                    "<td>" + score + "</td>" +
                "</tr>";
        }

        updateTopThree(
            leaderboard
        );

        updateOwnSchool(
            leaderboard
        );
    }

    catch(error) {

        console.log(error);

        leaderboardBody.innerHTML =
            "<tr><td colspan='5'>Kunne ikke hente leaderboard</td></tr>";
    }
}


// Opdaterer top 3 - US7
function updateTopThree(leaderboard) {

    const topThreeList =
        document.getElementById("topThreeList");

    if (topThreeList === null) {
        return;
    }

    topThreeList.innerHTML =
        "";

    if (leaderboard.length === 0) {

        topThreeList.innerHTML =
            "<li>Ingen data endnu</li>";

        return;
    }

    let maxCount =
        leaderboard.length;

    if (maxCount > 3) {
        maxCount = 3;
    }

    for (let index = 0; index < maxCount; index++) {

        const item =
            leaderboard[index];

        topThreeList.innerHTML +=
            "<li>" +
                "<span class='rank'>" + (index + 1) + "</span>" +
                getLeaderboardName(item) +
                "<span class='right green'>" + getLeaderboardValue(item.score, item.averageScore, item.bestScore, item.totalScore) + "</span>" +
            "</li>";
    }
}


// Opdaterer egen skole felt - US7
function updateOwnSchool(leaderboard) {

    const ownSchoolRank =
        document.getElementById("ownSchoolRank");

    const ownSchoolScore =
        document.getElementById("ownSchoolScore");

    if (ownSchoolRank === null || ownSchoolScore === null) {
        return;
    }

    for (let index = 0; index < leaderboard.length; index++) {

        const item =
            leaderboard[index];

        const name =
            getLeaderboardName(item);

        if (name === "Roskilde Skole") {

            ownSchoolRank.innerHTML =
                "#" + (index + 1);

            ownSchoolScore.innerHTML =
                "Score: " + getLeaderboardValue(item.score, item.averageScore, item.bestScore, item.totalScore);

            return;
        }
    }

    ownSchoolRank.innerHTML =
        "---";

    ownSchoolScore.innerHTML =
        "Roskilde Skole har ingen data for denne vejtype endnu";
}


// Sætter tekst ud fra id.
function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element !== null) {
        element.innerHTML = value;
    }
}


// Sætter checkbox ud fra id.
function setChecked(id, value) {

    const element =
        document.getElementById(id);

    if (element !== null) {
        element.checked = value;
    }
}


// Sætter aktiv tab ud fra id.
function setTabActive(id, isActive) {

    const element =
        document.getElementById(id);

    if (element === null) {
        return;
    }

    if (isActive === true) {
        element.classList.add("active");
    }
    else {
        element.classList.remove("active");
    }
}


// Returnerer fallback værdi.
function getValue(value) {

    if (value === undefined || value === null || value === "") {
        return "---";
    }

    return value;
}


// Returnerer tal fallback.
function getNumber(value) {

    if (value === undefined || value === null || value === "") {
        return 0;
    }

    return Number(value);
}


// Returnerer leaderboard navn med fallback.
function getLeaderboardName(item) {

    if (item.name !== undefined && item.name !== null) {
        return item.name;
    }

    if (item.schoolName !== undefined && item.schoolName !== null) {
        return item.schoolName;
    }

    if (item.school !== undefined && item.school !== null) {
        return item.school;
    }

    if (item.groupName !== undefined && item.groupName !== null) {
        return item.groupName;
    }

    if (item.group !== undefined && item.group !== null) {
        return item.group;
    }

    return "---";
}


// Returnerer leaderboard værdi med fallback.
function getLeaderboardValue(value1, value2, value3, value4) {

    if (value1 !== undefined && value1 !== null) {
        return value1;
    }

    if (value2 !== undefined && value2 !== null) {
        return value2;
    }

    if (value3 !== undefined && value3 !== null) {
        return value3;
    }

    if (value4 !== undefined && value4 !== null) {
        return value4;
    }

    return "---";
}


// Formaterer dato.
function formatDateTime(dateText) {

    if (dateText === undefined || dateText === null) {
        return "---";
    }

    if (dateText.length < 16) {
        return dateText;
    }

    return dateText.substring(0, 16).replace("T", " ");
}


// Forhindrer at samme handling kører flere gange på samme tid.
async function runTeacherActionSafe(functionToRun) {

    if (teacherActionIsRunning === true) {
        return;
    }

    teacherActionIsRunning =
        true;

    try {

        await functionToRun();
    }
    finally {

        teacherActionIsRunning =
            false;
    }
}


// Gør så Enter kan bruges i et input felt.
function addTeacherEnterKey(inputId, functionToRun) {

    const inputElement =
        document.getElementById(inputId);

    if (inputElement === null) {
        return;
    }

    inputElement.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            runTeacherActionSafe(
                functionToRun
            );
        }
    });
}


// Gør Enter klar på underviser sider.
function setupTeacherEnterKeys() {

    addTeacherEnterKey(
        "usernameInput",
        loginTeacher
    );

    addTeacherEnterKey(
        "passwordInput",
        loginTeacher
    );

    addTeacherEnterKey(
        "groupNameInput",
        createGroup
    );
}


// Starter funktioner når siden er loaded.
window.addEventListener("load", function() {

    setupTeacherEnterKeys();

    const logoutButtons =
        document.querySelectorAll(".global-logout");

    for (let index = 0; index < logoutButtons.length; index++) {

        const button =
            logoutButtons[index];

        button.addEventListener("click", function() {
            logoutTeacher();
        });
    }
});