const app = Vue.createApp({

    data() {

        return {

            sessionId: Number(localStorage.getItem("sessionId")) || 0,
            groupId: Number(localStorage.getItem("groupId")) || 0,
            groupName: localStorage.getItem("groupName") || "---",
            carType: localStorage.getItem("carType") || "---",
            roadType: localStorage.getItem("roadType") || "---",
            speedLimit: Number(localStorage.getItem("speedLimit")) || 0,
            scalingFactor: Number(localStorage.getItem("scalingFactor")) || 0,

            latestSpeed: "---",
            distance: "---",
            time: "---",
            difference: "---",

            feedback: "Feedback vises her",
            co2Text: "CO₂ resultat vises efter måling.",

            measurementCount: 0,
            totalSpeed: 0,
            totalCo2: 0,
            averageSpeed: "---",
            savedCo2: "---",

            funFact: "Vidste du at jævn fart kan give mindre CO₂?",
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
            selectedTtsLanguage: "da-DK",

            leaderboard: [],
            leaderboardRoadType: "byzone 50",
            leaderboardEnabled: true,
            loading: false,
            errorMessage: "",

            groups: [],
            selectedGroupId: "",
            selectedCarType: "",
            selectedRoadType: "",

            sessions: [],
            measurementsHistory: [],

            selectedCarTypeFilter: "",
            selectedRoadTypeFilter: "",
            sortType: "",
            
            selectedDate: "",
            startDate: "",
            endDate: "",
            
            showStudentSessionPopup: false, 
            selectedHistorySession: {},
            selectedHistoryMeasurements: []




        };
    },


   methods: {
    async loadRandomFunFact() {

    try {

        const response =
            await axios.get(
                apiUrl + "/FunFacts/random"
            );

        if (
            response.data !== undefined &&
            response.data !== null &&
            response.data.text !== undefined
        ) {
            this.funFact =
                response.data.text;
        }
    }

    catch(error) {

        console.log(
            "Kunne ikke hente fun fact:",
            error
        );

        this.funFact =
            "Vidste du at jævn fart kan give mindre CO₂?";
    }
},
    async showFunFact() {

        if (
            this.funFactsEnabled === false ||
            this.settings.showFunFact === false
        ) {
            return;
        }

        this.showFunFactPopup = true;
    },

    closeFunFactPopup() {

        this.showFunFactPopup = false;
    },

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

    if (
        responseData !== undefined &&
        responseData !== null &&
        responseData.measurements !== undefined
    ) {
        return this.normalizeArray(responseData.measurements);
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

        clearError() {

            this.errorMessage = "";
        },


        convertSettingValueToBoolean(value) {

            if (value === true || value === "true" || value === 1) {
                return true;
            }

            return false;
        },


        async loadGlobalSettings() {

            try {

                const response =
                    await axios.get(apiUrl + "/Settings");

                const settings =
                    this.normalizeArray(response.data);

                for (
                    let index = 0;
                    index < settings.length;
                    index++
                ) {

                    const setting = settings[index];

                    if (
                        setting.key === undefined ||
                        setting.key === null
                    ) {
                        continue;
                    }

                    const key =
                        setting.key.toLowerCase();

                    const value =
                        this.convertSettingValueToBoolean(setting.value);

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

                console.log("Kunne ikke hente settings:", error);
            }
        },


        async loadGroups() {

            this.clearError();

            try {

                const response =
                    await axios.get(apiUrl + "/Groups");

                this.groups =
                    this.normalizeArray(response.data);
            }

            catch(error) {

                console.log(error);

                this.groups = [];
                this.errorMessage = "Kunne ikke hente grupper";
            }
        },


        getGroupDisplayText(group) {

            let displayText = "";

            if (
                group.name !== undefined &&
                group.name !== null &&
                group.name !== ""
            ) {
                displayText = group.name;
            }

            if (
                group.school !== undefined &&
                group.school !== null &&
                group.school !== ""
            ) {
                displayText = displayText + " - " + group.school;
            }

            if (group.isLocked === true) {
                displayText = displayText + " (aktiv session)";
            }

            return displayText;
        },


        getSelectedGroupName() {

            for (
                let index = 0;
                index < this.groups.length;
                index++
            ) {

                const group = this.groups[index];

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
                roadType.toString().toLowerCase().trim();

            if (
                roadText.includes("byzone") ||
                roadText.includes("50")
            ) {
                roadValues.roadType = "byzone 50";
                roadValues.speedLimit = 50;
                roadValues.scalingFactor = 10;
                return roadValues;
            }

            if (
                roadText.includes("landevej") ||
                roadText.includes("80")
            ) {
                roadValues.roadType = "landevej 80";
                roadValues.speedLimit = 80;
                roadValues.scalingFactor = 15;
                return roadValues;
            }

            if (
                roadText.includes("motorvej") ||
                roadText.includes("110")
            ) {
                roadValues.roadType = "motorvej 110";
                roadValues.speedLimit = 110;
                roadValues.scalingFactor = 20;
                return roadValues;
            }

            return roadValues;
        },


        async startSession() {

            this.errorMessage = "";

            if (
                this.selectedGroupId === "" ||
                this.selectedCarType === "" ||
                this.selectedRoadType === ""
            ) {
                this.errorMessage = "Udfyld alle felter";
                return;
            }

            const roadValues =
                this.getRoadValues(this.selectedRoadType);

            if (
                roadValues.roadType === "" ||
                roadValues.speedLimit === 0
            ) {
                this.errorMessage =
                    "Vejtypen er ikke gyldig";
                return;
            }

            const session = {
                groupId: Number(this.selectedGroupId),
                carType: this.selectedCarType,
                roadType: roadValues.roadType,
                speedLimit: roadValues.speedLimit,
                status: "Active"
            };

            try {

                const response =
                    await axios.post(
                        apiUrl + "/Sessions",
                        session
                    );

                if (
                    response.data === undefined ||
                    response.data === null ||
                    response.data.id === undefined
                ) {
                    this.errorMessage =
                        "Session blev oprettet, men id mangler.";
                    return;
                }

                localStorage.setItem("sessionId", response.data.id);
                localStorage.setItem("groupId", this.selectedGroupId);
                localStorage.setItem("groupName", this.getSelectedGroupName());
                localStorage.setItem("carType", this.selectedCarType);
                localStorage.setItem("roadType", roadValues.roadType);
                localStorage.setItem("speedLimit", roadValues.speedLimit);
                localStorage.setItem("scalingFactor", roadValues.scalingFactor);

                localStorage.setItem(
    "isNavigating",
    "true"
);

window.location.href =
    "session.html";
            }

            catch(error) {

                console.log("Kunne ikke starte session:", error);

                if (
                    error.response !== undefined &&
                    error.response.data !== undefined &&
                    error.response.data.message !== undefined
                ) {
                    this.errorMessage = error.response.data.message;
                    return;
                }

                this.errorMessage = "Kunne ikke starte session";
            }
        },


        loadStudentSessionPage() {
                localStorage.removeItem(
    "isNavigating"
);
            this.sessionId =
                Number(localStorage.getItem("sessionId")) || 0;

            if (this.sessionId === 0) {
                window.location.href = "elev.html";
                return;
            }

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
            console.log("createMeasurement kører");
            this.errorMessage = "";

            this.sessionId =
                Number(localStorage.getItem("sessionId")) || 0;

            if (this.sessionId === 0) {
                this.errorMessage = "Ingen aktiv session";
                return;
            }

            const measuredTime =
                Math.random() * 0.5 + 0.2;

            const measurement = {
                sessionId: this.sessionId,
                time: Math.round(measuredTime * 100) / 100
            };

            try {

                const response =
    await axios.post(
        apiUrl + "/Measurements",
        measurement
    );

console.log(response.data);

const savedMeasurement =
    response.data;

                await this.showMeasurementResult(savedMeasurement);
            }

            catch(error) {

                console.log("Måling fejl:", error);

                if (
                    error.response !== undefined &&
                    error.response.data !== undefined &&
                    error.response.data.message !== undefined
                ) {
                    this.errorMessage =
                        error.response.data.message;

                    return;
                }

                if (
                    error.response !== undefined &&
                    error.response.data !== undefined
                ) {
                    this.errorMessage =
                        JSON.stringify(error.response.data);

                    return;
                }

                this.errorMessage =
                    "Kunne ikke gemme måling";
            }
        },


       async showMeasurementResult(savedMeasurement) {

            this.latestSpeed =
                Math.round(savedMeasurement.simulatedSpeed);

            this.distance =
                Math.round(savedMeasurement.distance) + " m";

            this.time =
                Math.round(savedMeasurement.time * 100) / 100 + " sek.";

            this.difference =
                Math.round(
                    Math.abs(
                        savedMeasurement.simulatedSpeed -
                        savedMeasurement.speedLimit
                    )
                );

            this.measurementCount =
                this.measurementCount + 1;

            this.totalSpeed =
                this.totalSpeed + savedMeasurement.simulatedSpeed;

            this.totalCo2 =
                this.totalCo2 + savedMeasurement.co2;

            this.averageSpeed =
                Math.round(
                    this.totalSpeed / this.measurementCount
                ) + " km/t";

            this.savedCo2 =
                Math.round(this.totalCo2) + " g";

            this.showFeedback(
    savedMeasurement.simulatedSpeed,
    savedMeasurement.speedLimit,
    savedMeasurement.co2
);

this.showCo2Feedback(savedMeasurement);

          if (
    this.funFactsEnabled === true &&
    this.settings.showFunFact === true
) {

    await this.loadRandomFunFact();

    this.showFunFactPopup = true;
}

},

async nextMeasurement() {
            this.errorMessage = "";
            this.showFunFactPopup = false;

            await this.createMeasurement();
        },


        async endSession() {

    this.errorMessage = "";

    try {

        this.sessionId =
            Number(localStorage.getItem("sessionId")) || 0;

        if (this.sessionId === 0) {

            window.location.href =
                "elev.html";

            return;
        }

        await axios.put(
            apiUrl +
            "/Sessions/" +
            this.sessionId +
            "/end"
        );

        this.showSummaryPopup = true;

        localStorage.removeItem("sessionId");
        localStorage.removeItem("groupId");
        localStorage.removeItem("groupName");
        localStorage.removeItem("carType");
        localStorage.removeItem("roadType");
        localStorage.removeItem("speedLimit");
        localStorage.removeItem("scalingFactor");
        localStorage.removeItem("isNavigating");
    }

    catch(error) {

        console.log(
            "Kunne ikke afslutte session:",
            error
        );

        this.errorMessage =
            "Kunne ikke afslutte session";
    }
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
                        Math.round(speed) +
                        " kilometer i timen."
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
                        Math.round(speed) +
                        " kilometer i timen."
                    );
                }

                return;
            }

            this.feedback =
                "🙂 Perfekt! Du ramte præcis fartgrænsen.";

            if (this.ttsEnabled === true) {
                this.speakText(
                    "Perfekt. Du ramte præcis fartgrænsen."
                );
            }
        },


        showCo2Feedback(measurement) {

            if (measurement.co2 === undefined) {
                this.co2Text =
                    "CO₂-data mangler fra backend.";
                return;
            }

            if (measurement.simulatedSpeed > measurement.speedLimit) {
                this.co2Text =
                    "Du brugte ca. " +
                    Math.round(measurement.co2) +
                    " gram CO₂.";
                return;
            }

            this.co2Text =
                "Du sparede ca. " +
                Math.round(measurement.co2) +
                " gram CO₂.";
        },


        playBeep() {

            console.log("Bip lyd");
        },


        speakText(text) {

            if ("speechSynthesis" in window === false) {
                return;
            }

            const speech =
                new SpeechSynthesisUtterance(text);

            speech.lang = this.selectedTtsLanguage;

            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(speech);
        },


       async loadHistory() {

    this.errorMessage = "";

    try {

        const groupId =
            localStorage.getItem("groupId");

        if (!groupId) {
            this.sessions = [];
            this.measurementsHistory = [];
            this.errorMessage = "Ingen gruppe valgt.";
            return;
        }

        const endpoint =
            apiUrl +
            "/Sessions/group/" +
            groupId +
            "/history";

        const sessionResponse =
            await axios.get(endpoint);

        this.sessions =
            this.normalizeArray(sessionResponse.data);

        console.log("Sessions fra backend:", this.sessions);

        this.measurementsHistory = [];

        for (let index = 0; index < this.sessions.length; index++) {

            const session =
                this.sessions[index];

            let measurements =
                session.measurements;

            if (measurements === undefined || measurements === null) {
                measurements = session.Measurements;
            }

            measurements =
                this.normalizeArray(measurements);

            console.log("Målinger for session " + session.id + ":", measurements);

            for (let measurementIndex = 0; measurementIndex < measurements.length; measurementIndex++) {

                this.measurementsHistory.push(
                    measurements[measurementIndex]
                );
            }
        }

        console.log("Alle målinger samlet:", this.measurementsHistory);
    }

    catch(error) {

        console.log(error);

        this.sessions = [];
        this.measurementsHistory = [];
        this.errorMessage = "Kunne ikke hente historik";
    }
},

       resetFilters() {

    this.selectedCarTypeFilter = "";
    this.selectedRoadTypeFilter = "";
    this.selectedDate = "";
    this.startDate = "";
    this.endDate = "";
    this.sortType = "";
},

        openStudentSessionDetails(session) {

    this.selectedHistorySession =
        session;

    let measurements =
        session.measurements;

    if (
        measurements !== undefined &&
        measurements !== null &&
        measurements.$values !== undefined
    ) {
        measurements =
            measurements.$values;
    }

    if (
        measurements === undefined ||
        measurements === null
    ) {
        measurements =
            [];
    }

    this.selectedHistoryMeasurements =
        measurements;

    this.showStudentSessionPopup =
        true;
},

closeStudentSessionDetails() {

    this.showStudentSessionPopup =
        false;

    this.selectedHistorySession =
        {};

    this.selectedHistoryMeasurements =
        [];
},

     async loadLeaderboard() {

    this.errorMessage = "";
    this.loading = true;

    await this.loadGlobalSettings();

    if (this.leaderboardEnabled === false) {
        this.leaderboard = [];
        this.loading = false;
        return;
    }

    try {

        const response =
            await axios.get(
                apiUrl +
                "/Leaderboard/student/school?roadType=" +
                encodeURIComponent(this.leaderboardRoadType)
            );

        let leaderboardData =
            response.data;

        if (
            leaderboardData !== undefined &&
            leaderboardData !== null &&
            leaderboardData.leaderboard !== undefined
        ) {
            leaderboardData =
                leaderboardData.leaderboard;
        }

        this.leaderboard =
            this.normalizeArray(leaderboardData);

        this.loading = false;
    }

    catch(error) {

        console.log(error);

        this.leaderboard = [];
        this.errorMessage = "Kunne ikke hente leaderboard";
        this.loading = false;
    }
},

        changeLeaderboardRoadType(roadType) {

            this.leaderboardRoadType = roadType;
            this.loadLeaderboard();
        },


        formatDate(dateText) {

            if (
                dateText === undefined ||
                dateText === null ||
                dateText.length < 10
            ) {
                return "---";
            }

            return dateText.substring(0, 10);
        },


        formatTime(dateText) {

            if (
                dateText === undefined ||
                dateText === null ||
                dateText.length < 16
            ) {
                return "---";
            }

            return dateText.substring(11, 16);
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

    if (this.selectedDate !== "") {

        result =
            result.filter(function(session) {

                return this.formatDate(session.date) ===
                    this.selectedDate;

            }, this);
    }

    if (this.startDate !== "") {

        result =
            result.filter(function(session) {

                return this.formatDate(session.date) >=
                    this.startDate;

            }, this);
    }

    if (this.endDate !== "") {

        result =
            result.filter(function(session) {

                return this.formatDate(session.date) <=
                    this.endDate;

            }, this);
    }

    if (this.sortType === "bestCo2") {

        result.sort(function(firstSession, secondSession) {

            return Number(firstSession.co2) -
                Number(secondSession.co2);
        });
    }

    if (this.sortType === "score") {

        result.sort(function(firstSession, secondSession) {

            return Number(firstSession.score) -
                Number(secondSession.score);
        });
    }

    if (this.sortType === "speedHigh") {

        result.sort(function(firstSession, secondSession) {

            return Number(secondSession.averageSpeed) -
                Number(firstSession.averageSpeed);
        });
    }

    if (this.sortType === "speedLow") {

        result.sort(function(firstSession, secondSession) {

            return Number(firstSession.averageSpeed) -
                Number(secondSession.averageSpeed);
        });
    }

    if (this.sortType === "timeLow") {

        result.sort(function(firstSession, secondSession) {

            return Number(firstSession.time) -
                Number(secondSession.time);
        });
    }

    return result;
},


        filteredMeasurements() {

            let result =
                Array.isArray(this.measurementsHistory)
                    ? this.measurementsHistory.slice()
                    : [];

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
    watch: {

    selectedCarTypeFilter() {
        this.loadHistory(); 
    },

    selectedRoadTypeFilter() {
        this.loadHistory();
    },

    selectedDate() {

        if (this.selectedDate !== "") {
            this.startDate = this.selectedDate;
            this.endDate = this.selectedDate;
        }

        this.loadHistory();
    },

    startDate() {
        this.loadHistory();
    },

    endDate() {
        this.loadHistory();
    },

    sortType() {
        this.loadHistory();
    }
},

    mounted() {

        console.log("Vue mounted");

        if (document.querySelector("#groupSelect")) {
            this.loadGroups();
        }

        if (document.querySelector(".session-page")) {
            this.loadStudentSessionPage();
        }

        if (document.querySelector(".student-history-page")) {
            this.loadHistory();
        }

       if (document.querySelector(".leaderboard-header")) {
        this.loadLeaderboard();
        const currentApp =
        this;
        const activeSessionId =
        localStorage.getItem("sessionId");
        if ( activeSessionId === null || activeSessionId === "")
             {
            setInterval(function () {
            currentApp.loadLeaderboard();
        }, 5000);
    }
}
    }
});


app.mount("#app");

