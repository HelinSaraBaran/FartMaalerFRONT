// Denne fil håndterer underviser funktioner.

let selectedLeaderboardType = "schools";
let selectedLeaderboardRoadType = "byzone 50";

let confirmModalAction = null;
let teacherActionIsRunning = false;

let allSessionsPageSessions = [];
let filteredSessionsPageSessions = [];
// Gemmer alle grupper fra API
let allGroups = [];


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

    clearError();

    try {

        const groupResponse =
            await axios.get(apiUrl + "/Groups");

        let groups =
            groupResponse.data;

        if (groups.$values !== undefined && groups.$values !== null) {
            groups = groups.$values;
        }

        allGroups = groups;

        if (groupTableBody === null) {
            return;
        }

        const sessionResponse =
            await axios.get(apiUrl + "/Sessions/admin");

        let sessions =
            sessionResponse.data.sessions;

        if (sessions === undefined || sessions === null) {
            sessions = sessionResponse.data.Sessions;
        }

        if (sessions === undefined || sessions === null) {
            sessions = [];
        }

        if (sessions.$values !== undefined && sessions.$values !== null) {
            sessions = sessions.$values;
        }

        groupTableBody.innerHTML = "";

        if (groups.length === 0) {

            groupTableBody.innerHTML =
                "<tr><td colspan='6'>Ingen grupper endnu</td></tr>";

            return;
        }

        for (let index = 0; index < groups.length; index++) {

            const group =
                groups[index];

            let sessionCount = 0;
            let measurementCount = 0;

            for (let sessionIndex = 0; sessionIndex < sessions.length; sessionIndex++) {

                const session =
                    sessions[sessionIndex];

                if (getValue(session.groupName) === getValue(group.name)) {

                    sessionCount =
                        sessionCount + 1;

                    measurementCount =
                        measurementCount +
                        getNumber(session.measurementCount);
                }
            }

            let sessionText =
                sessionCount + " sessions / " + measurementCount + " målinger";

            groupTableBody.innerHTML +=
                "<tr>" +
                    "<td>" + getValue(group.id) + "</td>" +
                    "<td>" + getValue(group.name) + "</td>" +
                    "<td>" + getValue(group.school) + "</td>" +
                    "<td>Aktiv</td>" +
                    "<td>" + sessionText + "</td>" +
                    "<td class='actions' style='text-align:right;'>" +
                        "<button type='button' class='edit-btn' onclick='editGroup(" + group.id + ")'>Rediger</button>" +
                        "<button type='button' class='delete-btn-sm' onclick='deleteGroup(" + group.id + ")'>Slet</button>" +
                    "</td>" +
                "</tr>";
        }
    }

    catch(error) {

        console.log(error);

        if (groupTableBody !== null) {

            groupTableBody.innerHTML =
                "<tr><td colspan='6'>Kunne ikke hente grupper</td></tr>";
        }

        showError("Kunne ikke hente grupper fra API");
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

        if (
            error.response !== undefined &&
            error.response.data !== undefined &&
            error.response.data.message !== undefined
        ) {

            showInfoModal(
                "Gruppenavn er optaget",
                error.response.data.message
            );

            groupNameInput.focus();

            return;
        }

        showInfoModal(
            "Fejl",
            "Kunne ikke oprette gruppe"
        );
    }
}


// Redigerer gruppe - US5
let currentEditGroupId = 0;

function editGroup(id) {

    currentEditGroupId =
        id;

    const modal =
        document.getElementById(
            "editGroupModal"
        );

    const input =
        document.getElementById(
            "editGroupInput"
        );

    if (modal === null || input === null) {
        return;
    }

    input.value =
        "";

    modal.style.display =
        "flex";

    input.focus();
}


async function saveEditedGroup() {

    clearError();

    const input =
        document.getElementById(
            "editGroupInput"
        );

    if (input === null) {
        return;
    }

    const newName =
        input.value.trim();

    if (newName === "") {

        showError(
            "Skriv et gruppenavn"
        );

        return;
    }

    const updatedGroup = {
        id: currentEditGroupId,
        name: newName,
        school: "Roskilde Skole",
        isLocked: false
    };

    try {

        await axios.put(
            apiUrl + "/Groups/" + currentEditGroupId,
            updatedGroup
        );

        closeEditGroupModal();

        await loadGroups();
    }

    catch(error) {

        console.log(error);

        showError(
            "Kunne ikke redigere gruppe"
        );
    }
}


function closeEditGroupModal() {

    const modal =
        document.getElementById(
            "editGroupModal"
        );

    if (modal !== null) {

        modal.style.display =
            "none";
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
    await loadGroupOverview();

    setInterval(function() {
        loadOverview();
    }, 5000);
}


// Henter overblik og live målinger - US6
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
                apiUrl + "/Measurements/live-overview"
            );

        let measurements =
            response.data;

        if (
            measurements.$values !== undefined &&
            measurements.$values !== null
        ) {

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

            const overview =
                measurements[index];

            const latestMeasurement =
                overview.latestMeasurement;

            if (
                latestMeasurement === undefined ||
                latestMeasurement === null
            ) {

                continue;
            }

            const speed =
                getNumber(
                    latestMeasurement.simulatedSpeed
                );

            const co2 =
                getNumber(
                    latestMeasurement.co2
                );

            const score =
                Math.abs(
                    speed -
                    getNumber(
                        latestMeasurement.speedLimit
                    )
                ) + co2;

            totalSpeed =
                totalSpeed + speed;

            totalCo2 =
                totalCo2 + co2;

            totalScore =
                totalScore + score;

            latestMeasurementsBody.innerHTML +=
            "<tr>" +
            "<td>" + getOverviewGroupName(overview) + "</td>" +
            "<td>" + speed + " km/t</td>" +
            "<td>" + co2 + " g</td>" +
            "<td>" + Math.round(score) + "</td>" +
            "<td><span class='status green'>Målt</span></td>" +
            "</tr>";
        }

        setOverviewNumbers(
            Math.round(totalSpeed / measurements.length),
            Math.round(totalCo2 / measurements.length),
            Math.round(totalScore / measurements.length),
            measurements.length
        );
        // Opdaterer klasse score boksen
            updateClassScoreCard(
            measurements
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

    // OVERBLIK SIDE
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

    // MÅLING SIDE
    setText(
        "measurementAverageSpeedText",
        averageSpeed + " km/t"
    );

    setText(
        "measurementAverageCo2Text",
        averageCo2 + " g"
    );

    setText(
        "measurementAverageScoreText",
        averageScore
    );

    // Fælles
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

   await loadGroups();
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
                apiUrl + "/Measurements/live-overview"
            );

        let groups =
            response.data;

        if (groups.$values !== undefined && groups.$values !== null) {
                groups = groups.$values;}

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
        allSessionsPageSessions = sessions;
filteredSessionsPageSessions = sessions;

fillMeasurementSessionFilters(sessions);

displayMeasurementSessions(
    filteredSessionsPageSessions
);
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
                    "<td>" + formatCarType(session.carType) + "</td>" +
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

        // Tilføjer kun én version af hver biltype
        addUniqueOption(
            carTypeFilter,
            formatCarType(session.carType),
            formatCarType(session.carType)
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
            formatCarType(session.carType);

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
            "<tr class='click-row' onclick='openSessionDetails(" + getSessionId(session) + ", " + index + ")'>" +
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

    // Hvis API allerede sender groupName
    if (
        session.groupName !== undefined &&
        session.groupName !== null
    ) {
        return session.groupName;
    }

    // Hvis API sender GroupName
    if (
        session.GroupName !== undefined &&
        session.GroupName !== null
    ) {
        return session.GroupName;
    }

    // Hvis session har group object
    if (
        session.group !== undefined &&
        session.group !== null
    ) {

        if (
            session.group.name !== undefined &&
            session.group.name !== null
        ) {
            return session.group.name;
        }
    }

    // Finder gruppen via groupId
    let groupId = null;

    if (
        session.groupId !== undefined &&
        session.groupId !== null
    ) {

        groupId =
            session.groupId;
    }

    if (
        session.GroupId !== undefined &&
        session.GroupId !== null
    ) {

        groupId =
            session.GroupId;
    }

    // Søger i alle grupper
    if (groupId !== null) {

        for (
            let index = 0;
            index < allGroups.length;
            index++
        ) {

            const group =
                allGroups[index];

            if (Number(group.id) === Number(groupId)) 
                {
                return group.name;
            }
        }
    }

    return "---";
}
function getOverviewGroupName(overview) {

    if (
        overview.groupName !== undefined &&
        overview.groupName !== null
    ) {
        return overview.groupName;
    }

    if (
        overview.GroupName !== undefined &&
        overview.GroupName !== null
    ) {
        return overview.GroupName;
    }

    if (
        overview.group !== undefined &&
        overview.group !== null
    ) {

        if (
            overview.group.name !== undefined &&
            overview.group.name !== null
        ) {
            return overview.group.name;
        }
    }

    if (
        overview.name !== undefined &&
        overview.name !== null
    ) {
        return overview.name;
    }

    if (
        overview.groupId !== undefined &&
        overview.groupId !== null
    ) {
        return "Gruppe " + overview.groupId;
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
                    apiUrl + "/Groups/all"
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
// Henter underviser leaderboard - US7
async function loadTeacherLeaderboard() {

    await loadLeaderboard();

    setInterval(function () {

        loadLeaderboard();

    }, 5000);
}


// Skifter leaderboard type - US7
function changeLeaderboardRoadType(roadType) {

    selectedLeaderboardRoadType =
        roadType;

    setTabActive(
        "byzoneTab",
        roadType === "byzone 50"
    );

    setTabActive(
        "landevejTab",
        roadType === "landevej 80"
    );

    setTabActive(
        "motorvejTab",
        roadType === "motorvej 110"
    );

    loadLeaderboard();
}

// Opdaterer klasse score boksen
function updateClassScoreCard(measurements) {

    const classScoreValue =
        document.getElementById(
            "classScoreValue"
        );

    const activeGroupsText =
        document.getElementById(
            "activeGroupsText"
        );

    const bestGroupText =
        document.getElementById(
            "bestGroupText"
        );

    if (
        classScoreValue === null ||
        activeGroupsText === null ||
        bestGroupText === null
    ) {
        return;
    }

    if (
        measurements === undefined ||
        measurements.length === 0
    ) {

        classScoreValue.innerText =
            "---";

        activeGroupsText.innerText =
            "---";

        bestGroupText.innerText =
            "---";

        return;
    }

    let totalScore = 0;

    let bestScore = 999999;

    let bestGroup =
        "---";

    const uniqueGroups =
        [];

    for (
        let index = 0;
        index < measurements.length;
        index++
    ) {

        const measurement =
            measurements[index];

        // Henter latest measurement
        const latestMeasurement =
            measurement.latestMeasurement;

        // Springer over hvis measurement mangler
        if (
            latestMeasurement === undefined ||
            latestMeasurement === null
        ) {
        continue;
    }

        // Henter hastighed
        const speed =
            getNumber(
            latestMeasurement.simulatedSpeed
    );
        // Henter CO2
        const co2 =
            getNumber(
            latestMeasurement.co2);

        // Beregner score
        const score =
            Math.abs(speed - getNumber(
            latestMeasurement.speedLimit
        )) + co2;
            if (isNaN(score) === false) {

        totalScore =
            totalScore + score;}

        const groupName =
            getOverviewGroupName(
                measurement
            );

        if (
            uniqueGroups.includes(groupName)
            === false
        ) {
            uniqueGroups.push(groupName);
        }

        if (score < bestScore) {

            bestScore =
                score;

            bestGroup =
                groupName;
        }
    }

    const averageScore =
        totalScore / measurements.length;

    classScoreValue.innerText =
        Math.round(averageScore);

    activeGroupsText.innerText =
        uniqueGroups.length;

    bestGroupText.innerText =
        bestGroup;
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

       const backendRoadType =
    getBackendRoadType(selectedLeaderboardRoadType);

if (selectedLeaderboardType === "schools") {
    endpoint =
        apiUrl +
        "/Leaderboard/admin/school?roadType=" +
        encodeURIComponent(backendRoadType);
}

if (selectedLeaderboardType === "classes") {
    endpoint =
        apiUrl +
        "/Leaderboard/admin/class?roadType=" +
        encodeURIComponent(backendRoadType);
}

        const response =
            await axios.get(
                endpoint
            );

        let leaderboard =
    response.data.leaderboard;
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

let name =
    getLeaderboardName(item);

if (selectedLeaderboardType === "schools") {

    if (index === 0) {
        name = "Roskilde Skole";
    }

    if (index === 1) {
        name = "Holbæk Skole";
    }

    if (index === 2) {
        name = "Køge Skole";
    }

    if (index === 3) {
        name = "Næstved Skole";
    }
}

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

function getBackendRoadType(roadType) {

    if (roadType === undefined || roadType === null) {
        return "byzone 50";
    }

    const roadText =
        roadType.toString().toLowerCase().trim();

    if (roadText.includes("byzone") || roadText.includes("50")) {
        return "byzone 50";
    }

    if (roadText.includes("landevej") || roadText.includes("80")) {
        return "landevej 80";
    }

    if (roadText.includes("motorvej") || roadText.includes("110")) {
        return "motorvej 110";
    }

    return "byzone 50";
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

//Sikre at det vil ende det samme sted selvom det er stort eller lille
function formatCarType(carType) {

    if (
        carType === undefined ||
        carType === null
    ) {
        return "---";
    }

    carType =
        carType.toString().toLowerCase().trim();

    if (carType === "benzin lille") {
        return "Benzin Lille";
    }

    if (carType === "benzin stor") {
        return "Benzin Stor";
    }

    if (carType === "hybrid") {
        return "Hybrid";
    }

    if (carType === "diesel") {
        return "Diesel";
    }

    return carType;
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

    // Hvis vi er på gruppe leaderboard
    if (selectedLeaderboardType === "classes") {

        if (
            item.groupName !== undefined &&
            item.groupName !== null
        ) {
            return item.groupName;
        }

        if (
            item.group !== undefined &&
            item.group !== null
        ) {
            return item.group;
        }

        if (
            item.name !== undefined &&
            item.name !== null
        ) {
            return item.name;
        }
    }

    // Hvis vi er på skole leaderboard
    if (
        item.schoolName !== undefined &&
        item.schoolName !== null
    ) {
        return item.schoolName;
    }

    if (
        item.school !== undefined &&
        item.school !== null
    ) {
        return item.school;
    }

    if (
        item.name !== undefined &&
        item.name !== null
    ) {
        return item.name;
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

// Viser info popup.
function showInfoModal(title, text) {

    const modal =
        document.getElementById("infoModal");

    const titleElement =
        document.getElementById("infoModalTitle");

    const textElement =
        document.getElementById("infoModalText");

    if (modal === null || titleElement === null || textElement === null) {

        alert(text);

        return;
    }

    titleElement.innerHTML =
        title;

    textElement.innerHTML =
        text;

    modal.style.display =
        "flex";
}


// Lukker info popup.
function closeInfoModal() {

    const modal =
        document.getElementById("infoModal");

    if (modal !== null) {

        modal.style.display =
            "none";
    }
}

// Åbner popup med session detaljer og målinger.
async function openSessionDetails(sessionId, sessionIndex) {

    const modal =
        document.getElementById("sessionDetailsModal");

    const title =
        document.getElementById("sessionPopupTitle");

    const info =
        document.getElementById("sessionPopupInfo");

    const body =
        document.getElementById("sessionPopupMeasurementsBody");

    if (modal === null || title === null || info === null || body === null) {
        return;
    }

    modal.style.display = "flex";
    title.innerHTML = "Session #" + sessionId;
    info.innerHTML = "Indlæser session.";
    body.innerHTML = "<tr><td colspan='5'>Indlæser målinger.</td></tr>";

    try {

        const sessionResponse =
            await axios.get(apiUrl + "/Sessions/" + sessionId);

        const measurementResponse =
            await axios.get(apiUrl + "/Measurements/session/" + sessionId);

        let session =
    sessionResponse.data;

if (
    sessionIndex !== undefined &&
    filteredSessionsPageSessions[sessionIndex] !== undefined
) {
    session = filteredSessionsPageSessions[sessionIndex];
}

        let measurements =
            measurementResponse.data;

        if (measurements.$values !== undefined && measurements.$values !== null) {
            measurements = measurements.$values;
        }

        info.innerHTML =
            "<strong>Gruppe:</strong> " +
            getSessionGroupName(session) +
            " | <strong>Status:</strong> " +
            getValue(session.status);

        if (measurements.length === 0) {

            body.innerHTML =
                "<tr><td colspan='5'>Ingen målinger endnu</td></tr>";

            return;
        }

        body.innerHTML = "";

        for (let index = 0; index < measurements.length; index++) {

            const measurement =
                measurements[index];

            body.innerHTML +=
                "<tr>" +
                    "<td>" + (index + 1) + "</td>" +
                    "<td>" + getNumber(measurement.simulatedSpeed) + " km/t</td>" +
                    "<td>" + getNumber(measurement.co2) + " g</td>" +
                    "<td>" + getNumber(measurement.time) + " sek</td>" +
                    "<td>" + getNumber(measurement.distance) + " m</td>" +
                "</tr>";
        }
    }

    catch(error) {

        console.log(error);

        body.innerHTML =
            "<tr><td colspan='5'>Kunne ikke hente session detaljer</td></tr>";
    }
}


// Lukker popup.
function closeSessionDetailsModal() {

    const modal =
        document.getElementById("sessionDetailsModal");

    if (modal !== null) {
        modal.style.display =
            "none";
    }
}
// Fylder filter dropdowns på målings-siden.
function fillMeasurementSessionFilters(sessions) {

    const groupFilter =
        document.getElementById("measurementSessionGroupFilter");

    const carTypeFilter =
        document.getElementById("measurementSessionCarTypeFilter");

    const statusFilter =
        document.getElementById("measurementSessionStatusFilter");

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
            formatCarType(session.carType),
            formatCarType(session.carType)
            );

        addUniqueOption(
            statusFilter,
            getValue(session.status),
            getValue(session.status)
        );
    }
}
// Filtrerer sessions på målings-siden.
function filterMeasurementSessions() {

    const groupFilter =
        document.getElementById("measurementSessionGroupFilter");

    const carTypeFilter =
        document.getElementById("measurementSessionCarTypeFilter");

    const statusFilter =
        document.getElementById("measurementSessionStatusFilter");

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

        let shouldShow =
            true;

        if (
            selectedGroup !== "all" &&
            getSessionGroupName(session) !== selectedGroup
        ) {
            shouldShow = false;
        }

        // Tjekker om valgt biltype matcher sessionens biltype
        if (
            selectedCarType !== "all" &&
            formatCarType(session.carType) !== selectedCarType
        ) {
            shouldShow = false;
        }

        if (
            selectedStatus !== "all" &&
            getValue(session.status) !== selectedStatus
        ) {
            shouldShow = false;
        }

        if (shouldShow === true) {

            filteredSessionsPageSessions.push(
                session
            );
        }
    }

    sortMeasurementSessions();
}


// Sorterer sessions på målings-siden.
function sortMeasurementSessions() {

    const sortSelect =
        document.getElementById("measurementSessionSortSelect");

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

    displayMeasurementSessions(
        filteredSessionsPageSessions
    );
}


// Viser sessions på målings-siden.
function displayMeasurementSessions(sessions) {

    const sessionsTableBody =
        document.getElementById("sessionsTableBody");

    if (sessionsTableBody === null) {
        return;
    }

    sessionsTableBody.innerHTML =
        "";

    if (sessions.length === 0) {

        sessionsTableBody.innerHTML =
            "<tr><td colspan='8'>Ingen sessions fundet</td></tr>";

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
                "<button type='button' class='edit-btn' onclick='endSession(" + getSessionId(session) + "); event.stopPropagation();'>Afslut</button>";
        }

        sessionsTableBody.innerHTML +=
            "<tr class='click-row' onclick='openSessionDetails(" + getSessionId(session) + ")'>" +

                "<td>" + getSessionGroupName(session) + "</td>" +

                "<td>" + formatCarType(session.carType) + "</td>" +

                "<td>" + getValue(session.roadType) + "</td>" +

                "<td>" + getSessionSpeed(session) + " km/t</td>" +

                "<td>" + getValue(session.status) + "</td>" +

                "<td>" + formatSessionDate(session) + "</td>" +

                "<td>" + endButton + "</td>" +

                "<td>" +
                    "<button type='button' class='delete-btn-sm' onclick='deleteSession(" + getSessionId(session) + "); event.stopPropagation();'>Slet</button>" +
                "</td>" +

            "</tr>";
    }
}

 // Henter gruppe overblik fra API
async function loadGroupOverview() {

    const groupOverviewBody =
        document.getElementById(
            "groupOverviewBody"
        );

    if (groupOverviewBody === null) {
        return;
    }

    try {

        const response =
            await axios.get(
                apiUrl + "/Measurements/live-overview"
            );

        let groups =
            response.data;

        if (
            groups.$values !== undefined &&
            groups.$values !== null
        ) {
            groups = groups.$values;
        }

        groupOverviewBody.innerHTML = "";

        if (groups.length === 0) {

            groupOverviewBody.innerHTML =
                "<tr><td colspan='5'>Ingen grupper endnu</td></tr>";

            return;
        }

        for (let index = 0; index < groups.length; index++) {

            const group =
                groups[index];

            const latestMeasurement =
                group.latestMeasurement;

            if (
                latestMeasurement === undefined ||
                latestMeasurement === null
            ) {
                continue;
            }

            const speed =
                getNumber(
                    latestMeasurement.simulatedSpeed
                );

            const co2 =
                getNumber(
                    latestMeasurement.co2
                );

            const score =
                Math.round(
                    Math.abs(
                        speed -
                        getNumber(
                            latestMeasurement.speedLimit
                        )
                    ) + co2
                );

            let trendText =
                "Stabil";

            let trendClass =
                "green";

            if (score > 100) {

                trendText =
                    "Høj";

                trendClass =
                    "red";
            }

            if (score > 50 && score <= 100) {

                trendText =
                    "Medium";

                trendClass =
                    "orange";
            }

            groupOverviewBody.innerHTML +=

                "<tr>" +

                    "<td>" +
                        getOverviewGroupName(group) +
                    "</td>" +

                    "<td>" +
                        speed + " km/t" +
                    "</td>" +

                    "<td>" +
                        co2 + " g" +
                    "</td>" +

                    "<td>" +
                        score +
                    "</td>" +

                    "<td class='trend " + trendClass + "'>" +
                        trendText +
                    "</td>" +

                "</tr>";
        }
    }

    catch(error) {

        console.log(error);

        groupOverviewBody.innerHTML =
            "<tr><td colspan='5'>Kunne ikke hente grupper</td></tr>";
    }
}
