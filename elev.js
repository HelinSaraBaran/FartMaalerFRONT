const apiUrl =
    "https://fartmaalerapi20260511134506-fnarawbzewapckck.switzerlandnorth-01.azurewebsites.net/api";


const app = Vue.createApp({

    data() {

        return {

            /* Session */

            sessionId:
                Number(localStorage.getItem("sessionId")) || 0,

            groupId:
                Number(localStorage.getItem("groupId")) || 0,

            groupName:
                localStorage.getItem("groupName") || "---",

            carType:
                localStorage.getItem("carType") || "---",

            roadType:
                localStorage.getItem("roadType") || "---",

            speedLimit:
                Number(localStorage.getItem("speedLimit")) || 0,

            scalingFactor:
                Number(localStorage.getItem("scalingFactor")) || 0,


            latestSpeed: "---",
            distance: "---",
            time: "---",
            difference: "---",

            feedback:
                "Feedback vises her",

            co2Text:
                "CO₂ resultat vises efter måling.",

            measurementCount: 0,

            averageSpeed: "---",

            savedCo2: "---",

            funFact:
                "Vidste du at jævn fart kan give mindre CO₂?",

            showSummaryPopup: false,

            showFunFactPopup: false,

            settings: {
                showFeedback: true,
                showFunFact: true
            },

            soundEnabled: true,
            ttsEnabled: true,
            visualEnabled: true,

            beepEnabled: true,
            funFactsEnabled: true,
            ttsFunFactEnabled: true,


            /* Leaderboard */

            leaderboard: [],
            leaderboardRoadType: "byzone 50",
            leaderboardEnabled: true,
            loading: false,
            errorMessage: "",


            /* Start session */

            groups: [],
            selectedGroupId: "",
            selectedCarType: "",
            selectedRoadType: "",


            /* Opsummering */

            sessions: [],
            measurementsHistory: [],

            filterSessions: true,
            filterMeasurements: true,

            selectedCarTypeFilter: "",
            selectedRoadTypeFilter: "",

            sortType: ""
        };
    },


    methods: {

        /* HELPERS */

        normalizeArray(responseData) {

            if (Array.isArray(responseData)) {
                return responseData;
            }

            if (
                responseData !== undefined &&
                responseData !== null &&
                responseData.$values !== undefined &&
                Array.isArray(responseData.$values)
            ) {
                return responseData.$values;
            }

            return [];
        },


        safeText(text) {

            if (
                text === undefined ||
                text === null ||
                text === ""
            ) {
                return "---";
            }

            return text;
        },


        safeNumber(numberValue) {

            if (
                numberValue === undefined ||
                numberValue === null ||
                numberValue === ""
            ) {
                return "---";
            }

            return numberValue;
        },


        clearError() {

            this.errorMessage =
                "";
        },


        convertSettingValueToBoolean(value) {

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

            if (value === 1) {
                return true;
            }

            if (value === 0) {
                return false;
            }

            return false;
        },


        /* SETTINGS */

        async loadGlobalSettings() {

            try {

                const response =
                    await axios.get(
                        apiUrl + "/Settings"
                    );

                const settings =
                    this.normalizeArray(
                        response.data
                    );

                for (
                    let index = 0;
                    index < settings.length;
                    index++
                ) {

                    const setting =
                        settings[index];

                    if (
                        setting.key === undefined ||
                        setting.key === null
                    ) {
                        continue;
                    }

                    const key =
                        setting.key.toLowerCase();

                    const value =
                        this.convertSettingValueToBoolean(
                            setting.value
                        );

                    if (key === "tts") {
                        this.ttsEnabled = value;
                    }

                    if (key === "biplyd") {
                        this.beepEnabled = value;
                        this.soundEnabled = value;
                    }

                    if (key === "funfacts") {
                        this.funFactsEnabled = value;
                        this.settings.showFunFact = value;
                    }

                    if (key === "ttsfunfact") {
                        this.ttsFunFactEnabled = value;
                    }

                    if (key === "leaderboard") {
                        this.leaderboardEnabled = value;
                    }

                    if (key === "visuelfeedback") {
                        this.visualEnabled = value;
                        this.settings.showFeedback = value;
                    }
                }
            }

            catch(error) {

                console.log(error);
            }
        },


        /* LOAD GROUPS */

        async loadGroups() {

            this.clearError();

            try {

                const response =
                    await axios.get(
                        apiUrl + "/Groups"
                    );

                this.groups =
                    this.normalizeArray(
                        response.data
                    );
            }

            catch(error) {

                console.log(error);

                this.groups =
                    [];

                this.errorMessage =
                    "Kunne ikke hente grupper";
            }
        },


        getGroupDisplayText(group) {

            let displayText =
                "";

            if (
                group.name !== undefined &&
                group.name !== null &&
                group.name !== ""
            ) {
                displayText =
                    group.name;
            }

            if (
                group.school !== undefined &&
                group.school !== null &&
                group.school !== ""
            ) {
                displayText =
                    displayText + " - " + group.school;
            }

            if (group.isLocked === true) {
                displayText =
                    displayText + " (aktiv session)";
            }

            return displayText;
        },


        getSelectedGroupName() {

            for (
                let index = 0;
                index < this.groups.length;
                index++
            ) {

                const group =
                    this.groups[index];

                if (
                    Number(group.id) ===
                    Number(this.selectedGroupId)
                ) {
                    return this.getGroupDisplayText(group);
                }
            }

            return "Valgt gruppe";
        },


        getRoadValues(roadType) {

            const roadValues = {
                roadType: "",
                speedLimit: 0,
                scalingFactor: 0
            };

            if (
                roadType === undefined ||
                roadType === null
            ) {
                return roadValues;
            }

            const roadText =
                roadType
                    .toString()
                    .toLowerCase()
                    .trim();

            if (
                roadText.includes("byzone") ||
                roadText.includes("50")
            ) {

                roadValues.roadType =
                    "byzone 50";

                roadValues.speedLimit =
                    50;

                roadValues.scalingFactor =
                    10;

                return roadValues;
            }

            if (
                roadText.includes("landevej") ||
                roadText.includes("80")
            ) {

                roadValues.roadType =
                    "landevej 80";

                roadValues.speedLimit =
                    80;

                roadValues.scalingFactor =
                    15;

                return roadValues;
            }

            if (
                roadText.includes("motorvej") ||
                roadText.includes("110")
            ) {

                roadValues.roadType =
                    "motorvej 110";

                roadValues.speedLimit =
                    110;

                roadValues.scalingFactor =
                    20;

                return roadValues;
            }

            return roadValues;
        },


        getRoadDisplayText(roadType) {

            if (
                roadType === undefined ||
                roadType === null
            ) {
                return "---";
            }

            const roadText =
                roadType
                    .toString()
                    .toLowerCase()
                    .trim();

            if (roadText.includes("byzone")) {
                return "Byzone 50";
            }

            if (roadText.includes("landevej")) {
                return "Landevej 80";
            }

            if (roadText.includes("motorvej")) {
                return "Motorvej 110";
            }

            return roadType;
        },


        /* START SESSION */

        async startSession() {

            this.errorMessage =
                "";

            if (
                this.selectedGroupId === "" ||
                this.selectedCarType === "" ||
                this.selectedRoadType === ""
            ) {

                this.errorMessage =
                    "Udfyld alle felter";

                return;
            }

            const roadValues =
                this.getRoadValues(
                    this.selectedRoadType
                );

            if (
                roadValues.roadType === "" ||
                roadValues.speedLimit === 0 ||
                roadValues.scalingFactor === 0
            ) {

                this.errorMessage =
                    "Vejtypen er ikke gyldig: " + this.selectedRoadType;

                return;
            }

            const session = {

                groupId:
                    Number(this.selectedGroupId),

                carType:
                    this.selectedCarType,

                roadType:
                    roadValues.roadType,

                speedLimit:
                    roadValues.speedLimit,

                status:
                    "Active"
            };

            try {

                console.log(
                    "Session der sendes til backend:",
                    session
                );

                const response =
                    await axios.post(
                        apiUrl + "/Sessions",
                        session
                    );

                localStorage.setItem(
                    "sessionId",
                    response.data.id
                );

                localStorage.setItem(
                    "groupId",
                    this.selectedGroupId
                );

                localStorage.setItem(
                    "groupName",
                    this.getSelectedGroupName()
                );

                localStorage.setItem(
                    "carType",
                    this.selectedCarType
                );

                localStorage.setItem(
                    "roadType",
                    roadValues.roadType
                );

                localStorage.setItem(
                    "speedLimit",
                    roadValues.speedLimit
                );

                localStorage.setItem(
                    "scalingFactor",
                    roadValues.scalingFactor
                );

                window.location.href =
                    "session.html";
            }

            catch(error) {

                console.log(error);

                if (
                    error.response !== undefined &&
                    error.response !== null &&
                    error.response.data !== undefined &&
                    error.response.data !== null &&
                    error.response.data.message !== undefined
                ) {

                    this.errorMessage =
                        error.response.data.message;

                    return;
                }

                this.errorMessage =
                    "Kunne ikke starte session";
            }
        },


        /* SESSION PAGE */

        loadStudentSessionPage() {

            this.sessionId =
                Number(localStorage.getItem("sessionId")) || 0;

            this.groupId =
                Number(localStorage.getItem("groupId")) || 0;

            this.groupName =
                localStorage.getItem("groupName") || "---";

            this.carType =
                localStorage.getItem("carType") || "---";

            this.roadType =
                localStorage.getItem("roadType") || "---";

            this.speedLimit =
                Number(localStorage.getItem("speedLimit")) || 0;

            this.scalingFactor =
                Number(localStorage.getItem("scalingFactor")) || 0;

            this.loadGlobalSettings();
        },


        async createMeasurement() {

            this.errorMessage =
                "";

            this.sessionId =
                Number(localStorage.getItem("sessionId")) || 0;

            this.carType =
                localStorage.getItem("carType") || "";

            this.roadType =
                localStorage.getItem("roadType") || "";

            this.speedLimit =
                Number(localStorage.getItem("speedLimit")) || 0;

            this.scalingFactor =
                Number(localStorage.getItem("scalingFactor")) || 0;

            if (this.sessionId === 0) {

                this.errorMessage =
                    "Ingen aktiv session";

                return;
            }

            if (
                this.carType === "" ||
                this.roadType === "" ||
                this.speedLimit === 0 ||
                this.scalingFactor === 0
            ) {

                this.errorMessage =
                    "Sessionens data mangler. Start en ny session.";

                return;
            }

            const measuredDistance =
                1;

            const measuredTime =
                Math.random() * 0.5 + 0.2;

            const realSpeed =
                measuredDistance / measuredTime;

            const simulatedSpeed =
                Math.round(
                    realSpeed * this.scalingFactor
                );

            const calculatedCo2 =
                this.calculateCo2(
                    this.carType,
                    simulatedSpeed
                );

            const calculatedScore =
                this.calculateScore(
                    simulatedSpeed,
                    this.speedLimit,
                    calculatedCo2
                );

            const measurement = {

                sessionId:
                    this.sessionId,

                speed:
                    simulatedSpeed,

                time:
                    Math.round(measuredTime * 100) / 100,

                distance:
                    measuredDistance,

                roadType:
                    this.roadType,

                carType:
                    this.carType,

                co2:
                    calculatedCo2,

                score:
                    calculatedScore
            };

            try {

                await axios.post(
                    apiUrl + "/Measurements",
                    measurement
                );

                this.latestSpeed =
                    measurement.speed;

                this.distance =
                    measurement.distance + " m";

                this.time =
                    measurement.time + " sek.";

                this.difference =
                    Math.abs(
                        measurement.speed - this.speedLimit
                    ) + " km/t";

                this.showFeedback(
                    measurement.speed,
                    this.speedLimit,
                    measurement.co2
                );

                this.showCo2Feedback(
                    measurement
                );

                this.measurementCount =
                    this.measurementCount + 1;

                this.calculateSessionAverages(
                    measurement
                );

                this.showFunFact();
            }

            catch(error) {

                console.log(error);

                this.errorMessage =
                    "Kunne ikke gemme måling";
            }
        },


        calculateSessionAverages(measurement) {

            if (
                this.averageSpeed === "---" ||
                this.measurementCount === 1
            ) {

                this.averageSpeed =
                    measurement.speed + " km/t";

                this.savedCo2 =
                    measurement.co2 + " g";

                return;
            }

            this.averageSpeed =
                measurement.speed + " km/t";

            this.savedCo2 =
                measurement.co2 + " g";
        },


        calculateCo2(carType, speed) {

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
        },


        calculateScore(speed, speedLimit, co2) {

            const difference =
                Math.abs(speed - speedLimit);

            return Math.round(
                difference + co2 / 10
            );
        },


        showFeedback(speed, speedLimit, co2) {

            if (this.visualEnabled === false) {
                return;
            }

            if (speed > speedLimit) {

                this.feedback =
                    "😠 For hurtigt — du bruger mere brændstof end nødvendigt.";

                if (this.soundEnabled === true) {
                    this.playBeep();
                }

                if (this.ttsEnabled === true) {

                    this.speakText(
                        "For hurtigt. Din hastighed er " +
                        speed +
                        " kilometer i timen. CO2 udledning er " +
                        co2 +
                        " gram."
                    );
                }

                return;
            }

            if (speed < speedLimit) {

                this.feedback =
                    "😐 For langsomt — prøv at komme tættere på fartgrænsen.";

                if (this.ttsEnabled === true) {

                    this.speakText(
                        "For langsomt. Din hastighed er " +
                        speed +
                        " kilometer i timen. Prøv at komme tættere på " +
                        speedLimit +
                        " kilometer i timen."
                    );
                }

                return;
            }

            this.feedback =
                "🙂 Perfekt! Du ramte præcis fartgrænsen.";

            if (this.ttsEnabled === true) {

                this.speakText(
                    "Perfekt. Du ramte præcis " +
                    speedLimit +
                    " kilometer i timen."
                );
            }
        },


        showCo2Feedback(measurement) {

            const co2AtLimit =
                this.calculateCo2(
                    measurement.carType,
                    this.speedLimit
                );

            const difference =
                measurement.co2 - co2AtLimit;

            if (difference > 0) {

                this.co2Text =
                    "Du brugte ca. " +
                    difference +
                    " gram mere CO₂ end ved fartgrænsen.";

                return;
            }

            if (difference < 0) {

                this.co2Text =
                    "Du sparede ca. " +
                    Math.abs(difference) +
                    " gram CO₂.";

                return;
            }

            this.co2Text =
                "Du ramte fartgrænsen og holdt CO₂-forbruget stabilt.";
        },


        playBeep() {

            console.log(
                "Bip lyd"
            );
        },


        speakText(text) {

            if ("speechSynthesis" in window === false) {
                return;
            }

            const speech =
                new SpeechSynthesisUtterance(text);

            speech.lang =
                "da-DK";

            window.speechSynthesis.cancel();

            window.speechSynthesis.speak(
                speech
            );
        },


        showFunFact() {

            if (this.funFactsEnabled === false) {
                return;
            }

            this.funFact =
                "Vidste du at jævn fart kan give mindre CO₂ end hårde accelerationer?";

            this.showFunFactPopup =
                true;

            if (
                this.ttsFunFactEnabled === true &&
                this.ttsEnabled === true
            ) {

                this.speakText(
                    this.funFact
                );
            }

            const currentApp =
                this;

            setTimeout(function() {

                currentApp.showFunFactPopup =
                    false;

            }, 5000);
        },


        closeFunFactPopup() {

            this.showFunFactPopup =
                false;
        },


        async endSession() {

            this.errorMessage =
                "";

            this.sessionId =
                Number(localStorage.getItem("sessionId")) || 0;

            if (this.sessionId === 0) {

                this.errorMessage =
                    "Ingen aktiv session";

                return;
            }

            try {

                await axios.put(
                    apiUrl +
                    "/Sessions/" +
                    this.sessionId +
                    "/end",
                    null
                );

                window.location.href =
                    "opsummering.html";
            }

            catch(error) {

                console.log(error);

                this.errorMessage =
                    "Kunne ikke afslutte session";
            }
        },


        /* HISTORY */

        async loadHistory() {

            try {

                const groupId =
                    localStorage.getItem(
                        "groupId"
                    );

                if (!groupId) {
                    return;
                }

                const sessionResponse =
                    await axios.get(
                        apiUrl +
                        "/Sessions/group/" +
                        groupId +
                        "/history"
                    );

                this.sessions =
                    this.normalizeArray(
                        sessionResponse.data
                    );

                const allMeasurements =
                    [];

                for (
                    let i = 0;
                    i < this.sessions.length;
                    i++
                ) {

                    const session =
                        this.sessions[i];

                    try {

                        const measurementResponse =
                            await axios.get(
                                apiUrl +
                                "/Measurements/session/" +
                                session.id
                            );

                        const measurements =
                            this.normalizeArray(
                                measurementResponse.data
                            );

                        for (
                            let measurementIndex = 0;
                            measurementIndex < measurements.length;
                            measurementIndex++
                        ) {

                            allMeasurements.push(
                                measurements[measurementIndex]
                            );
                        }
                    }

                    catch(error) {

                        console.log(error);
                    }
                }

                this.measurementsHistory =
                    allMeasurements;
            }

            catch(error) {

                console.log(error);

                this.sessions =
                    [];

                this.measurementsHistory =
                    [];
            }
        },


        resetFilters() {

            this.selectedCarTypeFilter =
                "";

            this.selectedRoadTypeFilter =
                "";

            this.sortType =
                "";
        },


        /* LEADERBOARD */

        changeLeaderboardRoadType(roadType) {

            const roadValues =
                this.getRoadValues(
                    roadType
                );

            if (roadValues.roadType !== "") {

                this.leaderboardRoadType =
                    roadValues.roadType;
            }

            this.selectedRoadType =
                roadType;

            this.loadLeaderboard();
        },


        changeRoadType(roadType) {

            this.changeLeaderboardRoadType(
                roadType
            );
        },


        async loadLeaderboard() {

            this.errorMessage =
                "";

            await this.loadGlobalSettings();

            if (this.leaderboardEnabled === false) {

                this.leaderboard =
                    [];

                return;
            }

            this.loading =
                true;

            try {

                const response =
                    await axios.get(
                        apiUrl +
                        "/Leaderboard?roadType=" +
                        encodeURIComponent(
                            this.leaderboardRoadType
                        )
                    );

                const leaderboardData =
                    this.normalizeArray(
                        response.data
                    );

                const normalizedLeaderboard =
                    [];

                for (
                    let index = 0;
                    index < leaderboardData.length;
                    index++
                ) {

                    const item =
                        leaderboardData[index];

                    normalizedLeaderboard.push({

                        groupName:
                            this.safeText(
                                item.groupName
                            ),

                        averageCo2:
                            this.safeNumber(
                                item.averageCo2
                            ),

                        measurementCount:
                            this.safeNumber(
                                item.measurementCount
                            ),

                        score:
                            this.safeNumber(
                                item.score
                            )
                    });
                }

                this.leaderboard =
                    normalizedLeaderboard;
            }

            catch(error) {

                console.log(error);

                this.leaderboard =
                    [];

                this.errorMessage =
                    "Kunne ikke hente leaderboard";
            }

            finally {

                this.loading =
                    false;
            }
        },


        formatDate(dateText) {

            if (
                dateText === undefined ||
                dateText === null ||
                dateText.length < 10
            ) {
                return "---";
            }

            return dateText.substring(
                0,
                10
            );
        },


        formatTime(dateText) {

            if (
                dateText === undefined ||
                dateText === null ||
                dateText.length < 16
            ) {
                return "---";
            }

            return dateText.substring(
                11,
                16
            );
        }
    },


    computed: {

        filteredSessions() {

            let result =
                Array.isArray(this.sessions)
                    ? this.sessions.slice()
                    : [];

            if (this.selectedCarTypeFilter !== "") {

                result =
                    result.filter(function(session) {

                        return session.carType ===
                            this.selectedCarTypeFilter;

                    }, this);
            }

            if (this.selectedRoadTypeFilter !== "") {

                result =
                    result.filter(function(session) {

                        const roadValues =
                            this.getRoadValues(
                                this.selectedRoadTypeFilter
                            );

                        return session.roadType ===
                            roadValues.roadType;

                    }, this);
            }

            if (this.sortType === "bestCo2") {

                result.sort(function(firstSession, secondSession) {

                    return firstSession.co2 - secondSession.co2;
                });
            }

            if (this.sortType === "worstCo2") {

                result.sort(function(firstSession, secondSession) {

                    return secondSession.co2 - firstSession.co2;
                });
            }

            if (this.sortType === "score") {

                result.sort(function(firstSession, secondSession) {

                    return firstSession.score - secondSession.score;
                });
            }

            return result;
        },


        filteredMeasurements() {

            let result =
                Array.isArray(this.measurementsHistory)
                    ? this.measurementsHistory.slice()
                    : [];

            if (this.sortType === "bestTime") {

                result.sort(function(firstMeasurement, secondMeasurement) {

                    return firstMeasurement.time - secondMeasurement.time;
                });
            }

            if (this.sortType === "worstTime") {

                result.sort(function(firstMeasurement, secondMeasurement) {

                    return secondMeasurement.time - firstMeasurement.time;
                });
            }

            return result;
        },


        bestSession() {

            if (
                !this.sessions ||
                this.sessions.length === 0
            ) {

                return {
                    score: "---",
                    carType: "---",
                    roadType: "---",
                    co2: "---"
                };
            }

            let best =
                this.sessions[0];

            for (
                let index = 1;
                index < this.sessions.length;
                index++
            ) {

                const current =
                    this.sessions[index];

                if (
                    current.score !== undefined &&
                    best.score !== undefined &&
                    current.score < best.score
                ) {
                    best =
                        current;
                }
            }

            return best;
        }
    },


    mounted() {

        console.log("Vue mounted");

        if (
            document.querySelector("#groupSelect")
        ) {
            this.loadGroups();
        }

        if (
            document.querySelector(".session-page") ||
            document.querySelector(".next-button") ||
            document.querySelector(".end-session-button")
        ) {
            this.loadStudentSessionPage();
        }

        if (
            document.querySelector(".summary-layout")
        ) {
            this.loadHistory();
        }

        if (
            document.querySelector(".leaderboard-header")
        ) {
            this.loadLeaderboard();
        }
    }
});


app.mount("#app");