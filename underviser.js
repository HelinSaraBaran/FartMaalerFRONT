// Denne fil håndterer underviser funktioner.

let selectedLeaderboardType = "schools";
let selectedLeaderboardRoadType = "Byzone";

let confirmModalAction = null;
let teacherActionIsRunning = false;

let allSessionsPageSessions = [];
let filteredSessionsPageSessions = [];


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

    const updatedGroup = {
        id: id,
        name: newName,
        school: "Roskilde Skole",
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
function deleteGroup(id) {

    showConfirmModal(
        "Slet gruppe?",
        "Er du sikker på, at du vil slette gruppen og dens sessions? Handlingen kan ikke fortrydes.",
        async function() {

            clearError();

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
    );
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

        let totalCount =
            0;

        for (let index = 0; index < settings.length; index++) {

            const setting =
                settings[index];

            if (setting.key === undefined || setting.key === null) {
                continue;
            }

            const key =
                setting.key.toLowerCase();

            const value =
                convertSettingValueToBoolean(
                    setting.value
                );

            totalCount =
                totalCount + 1;

            if (value === true) {

                enabledCount =
                    enabledCount + 1;
            }

            if (key === "tts") {

                setChecked(
                    "ttsToggle",
                    value
                );
            }

            if (key === "biplyd") {

                setChecked(
                    "beepToggle",
                    value
                );
            }

            if (key === "funfacts") {

                setChecked(
                    "funFactsToggle",
                    value
                );
            }

            if (key === "ttsfunfact") {

                setChecked(
                    "ttsFunFactToggle",
                    value
                );
            }

            if (key === "leaderboard") {

                setChecked(
                    "leaderboardToggle",
                    value
                );

                updateLeaderboardAdminText(
                    value
                );
            }

            if (key === "visuelfeedback") {

                setChecked(
                    "visualFeedbackToggle",
                    value
                );
            }
        }

        if (enabledCount === totalCount && totalCount > 0) {

            masterToggle.checked =
                true;
        }
        else {

            masterToggle.checked =
                false;
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

    try {

        await saveSettingOnly(
            key,
            value
        );

        await loadSettings();

        applyGlobalSettingsToAdminPage();
    }

    catch(error) {

        console.log("Fejl ved gem af indstilling:");
        console.log(error);

        if (error.response !== undefined) {

            console.log("Status:");
            console.log(error.response.status);

            console.log("Response data:");
            console.log(error.response.data);

            if (error.response.status === 401) {

                showError(
                    "Du er ikke logget ind. Log ind igen."
                );

                return;
            }

            if (error.response.status === 403) {

                showError(
                    "Du har ikke adgang til at ændre indstillinger."
                );

                return;
            }

            if (error.response.status === 404) {

                showError(
                    "Indstillingen blev ikke fundet: " + key
                );

                return;
            }

            if (error.response.status >= 500) {

                showError(
                    "Backend/server fejl ved gem af indstilling."
                );

                return;
            }
        }

        showError(
            "Kunne ikke gemme indstilling"
        );
    }
}


// Opdaterer alle indstillinger - US2
async function updateAllSettings() {

    const masterToggle =
        document.getElementById("masterToggle");

    if (masterToggle === null) {
        return;
    }

    clearError();

    const isChecked =
        masterToggle.checked;

    setChecked("ttsToggle", isChecked);
    setChecked("beepToggle", isChecked);
    setChecked("funFactsToggle", isChecked);
    setChecked("ttsFunFactToggle", isChecked);
    setChecked("leaderboardToggle", isChecked);
    setChecked("visualFeedbackToggle", isChecked);

    try {

        await saveSettingOnly(
            "TTS",
            isChecked
        );

        await saveSettingOnly(
            "BipLyd",
            isChecked
        );

        await saveSettingOnly(
            "FunFacts",
            isChecked
        );

        await saveSettingOnly(
            "TTSFunFact",
            isChecked
        );

        await saveSettingOnly(
            "Leaderboard",
            isChecked
        );

        await saveSettingOnly(
            "VisuelFeedback",
            isChecked
        );

        await loadSettings();

        applyGlobalSettingsToAdminPage();
    }

    catch(error) {

        console.log("Fejl ved gem af alle indstillinger:");
        console.log(error);

        if (error.response !== undefined) {

            console.log("Status:");
            console.log(error.response.status);

            console.log("Response data:");
            console.log(error.response.data);
        }

        showError(
            "Kunne ikke gemme alle indstillinger"
        );
    }
}


// Gemmer en indstilling - US2
async function saveSettingOnly(key, value) {

    const token =
        localStorage.getItem("token");

    if (token === null || token === "") {
        showError("Du er ikke logget ind. Log ind igen.");
        throw new Error("Token mangler");
    }

    const settingData = {
        key: key,
        value: value
    };

    await axios.put(
        apiUrl + "/Settings/" + key,
        settingData,
        {
            headers:
            {
                Authorization: "Bearer " + token
            }
        }
    );
}

// Opdaterer admin siden efter ændringer.
function applyGlobalSettingsToAdminPage() {

    const leaderboardToggle =
        document.getElementById("leaderboardToggle");

    if (leaderboardToggle !== null) {

        updateLeaderboardAdminText(
            leaderboardToggle.checked
        );
    }
}


// Opdaterer tekst om leaderboard på admin siden.
function updateLeaderboardAdminText(isEnabled) {

    const leaderboardInfo =
        document.getElementById("leaderboardAdminInfo");

    if (leaderboardInfo === null) {
        return;
    }

    const enabled =
        convertSettingValueToBoolean(
            isEnabled
        );

    if (enabled === true) {

        leaderboardInfo.innerHTML =
            "Leaderboard er synligt for elever.";
    }
    else {

        leaderboardInfo.innerHTML =
            "Leaderboard er skjult for elever, men underviseren kan stadig se det i admin.";
    }
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

        if (sessions.sessions !== undefined && sessions.sessions !== null) {

            sessions =
                sessions.sessions;
        }

        if (sessions.Sessions !== undefined && sessions.Sessions !== null) {

            sessions =
                sessions.Sessions;
        }

        if (sessions.$values !== undefined && sessions.$values !== null) {

            sessions =
                sessions.$values;
        }

        if (sessions === undefined || sessions === null) {

            sessions =
                [];
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

            if (getValue(session.status).toLowerCase() === "ended") {

                endButton =
                    "<span class='status green'>Afsluttet</span>";
            }
            else {

                endButton =
                    "<button type='button' class='edit-btn' onclick='endSession(" + getSessionId(session) + ")'>Afslut</button>";
            }

            sessionsTableBody.innerHTML +=
                "<tr>" +
                    "<td>" + getSessionGroupName(session) + "</td>" +
                    "<td>" + getValue(session.carType) + "</td>" +
                    "<td>" + getValue(session.roadType) + "</td>" +
                    "<td>" + getSessionSpeed(session) + " km/t</td>" +
                    "<td>" + getValue(session.status) + "</td>" +
                    "<td>" + formatSessionDate(session) + "</td>" +
                    "<td>" + endButton + "</td>" +
                    "<td><button type='button' class='delete-btn-sm' onclick='deleteSession(" + getSessionId(session) + ")'>Slet</button></td>" +
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


// Henter alle sessions til sessions siden - US3
async function loadSessionsPage() {

    const sessionsPageTableBody =
        document.getElementById("sessionsPageTableBody");

    if (sessionsPageTableBody === null) {
        return;
    }

    clearError();

    setText(
        "classAverageSpeedText",
        "-- km/t"
    );

    setText(
        "sessionsPageCountText",
        0
    );

    sessionsPageTableBody.innerHTML =
        "<tr class='session-empty-row'><td colspan='8'>Indlæser sessions...</td></tr>";

    try {

        const response =
            await axios.get(
                apiUrl + "/Sessions/admin"
            );

        const responseData =
            response.data;

        let sessions =
            responseData.sessions;

        if (sessions === undefined || sessions === null) {

            sessions =
                responseData.Sessions;
        }

        if (sessions === undefined || sessions === null) {

            sessions =
                [];
        }

        if (sessions.$values !== undefined && sessions.$values !== null) {

            sessions =
                sessions.$values;
        }

        allSessionsPageSessions =
            sessions;

        filteredSessionsPageSessions =
            sessions;

        fillSessionFilters(
            sessions
        );

        updateSessionsPageNumbersFromResponse(
            responseData,
            sessions
        );

        sortSessionsPage();
    }

    catch(error) {

        console.log(error);

        allSessionsPageSessions =
            [];

        filteredSessionsPageSessions =
            [];

        setText(
            "classAverageSpeedText",
            "-- km/t"
        );

        setText(
            "sessionsPageCountText",
            0
        );

        sessionsPageTableBody.innerHTML =
            "<tr class='session-empty-row'><td colspan='8'>Kunne ikke hente sessions</td></tr>";

        showError(
            "Kunne ikke hente sessions fra API"
        );
    }
}


// Fylder filter dropdowns på sessions siden.
function fillSessionFilters(sessions) {

    const groupFilter =
        document.getElementById("sessionGroupFilter");

    const carTypeFilter =
        document.getElementById("sessionCarTypeFilter");

    const statusFilter =
        document.getElementById("sessionStatusFilter");

    if (groupFilter !== null) {

        groupFilter.innerHTML =
            "<option value='all'>Alle grupper</option>";
    }

    if (carTypeFilter !== null) {

        carTypeFilter.innerHTML =
            "<option value='all'>Alle biltyper</option>";
    }

    if (statusFilter !== null) {

        statusFilter.innerHTML =
            "<option value='all'>Alle statusser</option>";
    }

    for (let index = 0; index < sessions.length; index++) {

        const session =
            sessions[index];

        addUniqueOption(
            groupFilter,
            getSessionGroupName(session),
            getSessionGroupName(session)
        );

        addUniqueOption(
            carTypeFilter,
            getValue(session.carType),
            getValue(session.carType)
        );

        addUniqueOption(
            statusFilter,
            getValue(session.status),
            getValue(session.status)
        );
    }
}


// Tilføjer kun option hvis den ikke findes i forvejen.
function addUniqueOption(selectElement, value, text) {

    if (selectElement === null) {
        return;
    }

    if (value === "---") {
        return;
    }

    for (let index = 0; index < selectElement.options.length; index++) {

        if (selectElement.options[index].value === value) {
            return;
        }
    }

    selectElement.innerHTML +=
        "<option value='" + value + "'>" + text + "</option>";
}


// Filtrerer sessions på sessions siden.
function filterSessionsPage() {

    const groupFilter =
        document.getElementById("sessionGroupFilter");

    const carTypeFilter =
        document.getElementById("sessionCarTypeFilter");

    const statusFilter =
        document.getElementById("sessionStatusFilter");

    let selectedGroup =
        "all";

    let selectedCarType =
        "all";

    let selectedStatus =
        "all";

    if (groupFilter !== null) {
        selectedGroup = groupFilter.value;
    }

    if (carTypeFilter !== null) {
        selectedCarType = carTypeFilter.value;
    }

    if (statusFilter !== null) {
        selectedStatus = statusFilter.value;
    }

    filteredSessionsPageSessions =
        [];

    for (let index = 0; index < allSessionsPageSessions.length; index++) {

        const session =
            allSessionsPageSessions[index];

        const groupName =
            getSessionGroupName(session);

        const carType =
            getValue(session.carType);

        const status =
            getValue(session.status);

        let shouldShow =
            true;

        if (selectedGroup !== "all" && groupName !== selectedGroup) {
            shouldShow = false;
        }

        if (selectedCarType !== "all" && carType !== selectedCarType) {
            shouldShow = false;
        }

        if (selectedStatus !== "all" && status !== selectedStatus) {
            shouldShow = false;
        }

        if (shouldShow === true) {

            filteredSessionsPageSessions.push(
                session
            );
        }
    }

    updateSessionsPageNumbers(
        filteredSessionsPageSessions
    );

    sortSessionsPage();
}


// Sorterer sessions på sessions siden.
function sortSessionsPage() {

    const sortSelect =
        document.getElementById("sessionSortSelect");

    let sortValue =
        "dateDesc";

    if (sortSelect !== null) {
        sortValue = sortSelect.value;
    }

    filteredSessionsPageSessions.sort(function(firstSession, secondSession) {

        if (sortValue === "dateAsc") {
            return new Date(getSessionDate(firstSession)) - new Date(getSessionDate(secondSession));
        }

        if (sortValue === "dateDesc") {
            return new Date(getSessionDate(secondSession)) - new Date(getSessionDate(firstSession));
        }

        if (sortValue === "groupAsc") {
            return getSessionGroupName(firstSession).localeCompare(getSessionGroupName(secondSession));
        }

        if (sortValue === "carTypeAsc") {
            return getValue(firstSession.carType).localeCompare(getValue(secondSession.carType));
        }

        if (sortValue === "speedAsc") {
            return getSessionSpeed(firstSession) - getSessionSpeed(secondSession);
        }

        if (sortValue === "speedDesc") {
            return getSessionSpeed(secondSession) - getSessionSpeed(firstSession);
        }

        return 0;
    });

    displaySessionsPage(
        filteredSessionsPageSessions
    );
}


// Viser sessions i tabellen på sessions siden.
function displaySessionsPage(sessions) {

    const sessionsPageTableBody =
        document.getElementById("sessionsPageTableBody");

    if (sessionsPageTableBody === null) {
        return;
    }

    sessionsPageTableBody.innerHTML =
        "";

    if (sessions.length === 0) {

        sessionsPageTableBody.innerHTML =
            "<tr class='session-empty-row'><td colspan='8'>Ingen sessions endnu</td></tr>";

        return;
    }

    const classAverage =
        calculateClassAverageSpeed(
            sessions
        );

    for (let index = 0; index < sessions.length; index++) {

        const session =
            sessions[index];

        let statusClass =
            "session-status-active";

        if (getValue(session.status).toLowerCase() === "ended" ||
            getValue(session.status).toLowerCase() === "afsluttet") {

            statusClass =
                "session-status-ended";
        }

        sessionsPageTableBody.innerHTML +=
            "<tr class='click-row'>" +
                "<td>" + getSessionGroupName(session) + "</td>" +
                "<td>" + formatSessionDate(session) + "</td>" +
                "<td>" + getValue(session.carType) + "</td>" +
                "<td>" + getValue(session.roadType) + "</td>" +
                "<td>" + getSessionSpeed(session) + " km/t</td>" +
                "<td>" + classAverage + " km/t</td>" +
                "<td class='" + statusClass + "'>" + getValue(session.status) + "</td>" +
                "<td>" +
                    "<button type='button' class='delete-btn-sm' onclick='deleteSession(" + getSessionId(session) + "); event.stopPropagation();'>Slet</button>" +
                "</td>" +
            "</tr>";
    }
}


// Opdaterer tal på sessions siden fra backend response.
function updateSessionsPageNumbersFromResponse(responseData, sessions) {

    let totalSessions =
        responseData.totalSessions;

    if (totalSessions === undefined || totalSessions === null) {

        totalSessions =
            responseData.TotalSessions;
    }

    if (totalSessions === undefined || totalSessions === null) {

        totalSessions =
            sessions.length;
    }

    let classAverageSpeed =
        responseData.classAverageSpeed;

    if (classAverageSpeed === undefined || classAverageSpeed === null) {

        classAverageSpeed =
            responseData.ClassAverageSpeed;
    }

    if (classAverageSpeed === undefined || classAverageSpeed === null) {

        classAverageSpeed =
            calculateClassAverageSpeed(sessions);
    }

    setText(
        "sessionsPageCountText",
        getNumber(totalSessions)
    );

    if (sessions.length === 0) {

        setText(
            "classAverageSpeedText",
            "-- km/t"
        );

        return;
    }

    setText(
        "classAverageSpeedText",
        getNumber(classAverageSpeed) + " km/t"
    );
}


// Opdaterer tal på sessions siden.
function updateSessionsPageNumbers(sessions) {

    if (sessions === undefined || sessions === null) {

        setText(
            "sessionsPageCountText",
            0
        );

        setText(
            "classAverageSpeedText",
            "-- km/t"
        );

        return;
    }

    setText(
        "sessionsPageCountText",
        sessions.length
    );

    if (sessions.length === 0) {

        setText(
            "classAverageSpeedText",
            "-- km/t"
        );

        return;
    }

    setText(
        "classAverageSpeedText",
        calculateClassAverageSpeed(sessions) + " km/t"
    );
}


// Beregner gennemsnit for hele klassen.
function calculateClassAverageSpeed(sessions) {

    if (sessions === undefined || sessions === null || sessions.length === 0) {
        return 0;
    }

    let totalSpeed =
        0;

    let validCount =
        0;

    for (let index = 0; index < sessions.length; index++) {

        const speed =
            getSessionSpeed(sessions[index]);

        if (isNaN(speed) === false) {

            totalSpeed =
                totalSpeed + speed;

            validCount =
                validCount + 1;
        }
    }

    if (validCount === 0) {
        return 0;
    }

    return Math.round(totalSpeed / validCount);
}


// Henter session id.
function getSessionId(session) {

    if (session.id !== undefined && session.id !== null) {
        return session.id;
    }

    if (session.sessionId !== undefined && session.sessionId !== null) {
        return session.sessionId;
    }

    if (session.SessionId !== undefined && session.SessionId !== null) {
        return session.SessionId;
    }

    return 0;
}


// Henter gruppenavn fra session.
function getSessionGroupName(session) {

    if (session.groupName !== undefined && session.groupName !== null) {
        return session.groupName;
    }

    if (session.GroupName !== undefined && session.GroupName !== null) {
        return session.GroupName;
    }

    if (session.group !== undefined && session.group !== null) {

        if (session.group.name !== undefined && session.group.name !== null) {
            return session.group.name;
        }
    }

    if (session.name !== undefined && session.name !== null) {
        return session.name;
    }

    if (session.groupId !== undefined && session.groupId !== null) {
        return "Gruppe " + session.groupId;
    }

    if (session.GroupId !== undefined && session.GroupId !== null) {
        return "Gruppe " + session.GroupId;
    }

    return "---";
}


// Henter dato fra session.
function getSessionDate(session) {

    if (session.createdAt !== undefined && session.createdAt !== null) {
        return session.createdAt;
    }

    if (session.date !== undefined && session.date !== null) {
        return session.date;
    }

    if (session.Date !== undefined && session.Date !== null) {
        return session.Date;
    }

    return "";
}


// Formaterer session dato.
function formatSessionDate(session) {

    return formatDateTime(
        getSessionDate(session)
    );
}


// Henter hastighed fra session.
function getSessionSpeed(session) {

    if (session.speed !== undefined && session.speed !== null) {
        return Number(session.speed);
    }

    if (session.averageSpeed !== undefined && session.averageSpeed !== null) {
        return Number(session.averageSpeed);
    }

    if (session.AverageSpeed !== undefined && session.AverageSpeed !== null) {
        return Number(session.AverageSpeed);
    }

    if (session.speedLimit !== undefined && session.speedLimit !== null) {
        return Number(session.speedLimit);
    }

    if (session.SpeedLimit !== undefined && session.SpeedLimit !== null) {
        return Number(session.SpeedLimit);
    }

    return 0;
}


// Afslutter session - US14
function endSession(id) {

    showConfirmModal(
        "Afslut session?",
        "Er du sikker på, at du vil afslutte denne session?",
        async function() {

            clearError();

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
                await loadSessionsPage();
            }

            catch(error) {

                console.log(error);

                showError(
                    "Kunne ikke afslutte session"
                );
            }
        }
    );
}


// Sletter session - US3
function deleteSession(id) {

    showConfirmModal(
        "Slet session?",
        "Er du sikker på, at du vil slette denne session? Handlingen kan ikke fortrydes.",
        async function() {

            clearError();

            try {

                await axios.delete(
                    apiUrl + "/Sessions/" + id
                );

                await loadSessions();
                await loadOverview();
                await loadSessionsPage();
            }

            catch(error) {

                console.log(error);

                showError(
                    "Kunne ikke slette session"
                );
            }
        }
    );
}


// Sletter al historik - US3
function deleteAllHistory() {

    showConfirmModal(
        "Slet al historik?",
        "Er du sikker på, at du vil slette al historik? Alle sessions og målinger bliver slettet.",
        async function() {

            clearError();

            try {

                await axios.delete(
                    apiUrl + "/Sessions/all"
                );

                await loadSessions();
                await loadOverview();
                await loadSessionsPage();
            }

            catch(error) {

                console.log(error);

                showError(
                    "Kunne ikke slette al historik. Tjek om backend har endpoint til dette."
                );
            }
        }
    );
}


// Sletter alle grupper - US5
function deleteAllGroups() {

    showConfirmModal(
        "Slet alle grupper?",
        "Er du sikker på, at du vil slette alle grupper?",
        async function() {

            clearError();

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
    );
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

        element.checked =
            convertSettingValueToBoolean(
                value
            );
    }
}


// Konverterer setting-værdi fra backend til rigtig boolean.
function convertSettingValueToBoolean(value) {

    if (value === true) {
        return true;
    }

    if (value === false) {
        return false;
    }

    if (value === "true") {
        return true;
    }

    if (value === "false") {
        return false;
    }

    if (value === "True") {
        return true;
    }

    if (value === "False") {
        return false;
    }

    return false;
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

    const number =
        Number(value);

    if (isNaN(number) === true) {
        return 0;
    }

    return number;
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

    if (dateText === undefined || dateText === null || dateText === "") {
        return "---";
    }

    if (dateText.length < 16) {
        return dateText;
    }

    return dateText.substring(0, 16).replace("T", " ");
}


// Viser den fælles pæne popup.
function showConfirmModal(title, text, actionToRun) {

    const modal =
        document.getElementById("confirmModal");

    const titleElement =
        document.getElementById("confirmModalTitle");

    const textElement =
        document.getElementById("confirmModalText");

    if (modal === null || titleElement === null || textElement === null) {

        const confirmed =
            confirm(text);

        if (confirmed === true) {
            actionToRun();
        }

        return;
    }

    titleElement.innerHTML =
        title;

    textElement.innerHTML =
        text;

    confirmModalAction =
        actionToRun;

    modal.style.display =
        "flex";
}


// Lukker den fælles popup.
function closeConfirmModal() {

    const modal =
        document.getElementById("confirmModal");

    if (modal !== null) {

        modal.style.display =
            "none";
    }

    confirmModalAction =
        null;
}


// Kører handlingen når der trykkes ja.
function runConfirmModalAction() {

    if (confirmModalAction !== null) {

        confirmModalAction();
    }

    closeConfirmModal();
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