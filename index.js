// Denne fil håndterer forsiden.


// Sender brugeren videre til elev siden - US8
function goToMeasurement() {

    window.location.href =
        "elev.html";
}


// Sender underviser videre til login siden - US1
function goToTeacherLogin() {

    window.location.href =
        "teacher-login.html";
}


// Gør så man kan trykke Enter på forsiden.
function setupFrontPageEnterKey() {

    document.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            goToMeasurement();
        }
    });
}


// Henter leaderboard på forsiden - US7
async function loadFrontPageLeaderboard() {

    const leaderboardList =
        document.getElementById("frontLeaderboardList");

    const leaderboardBox =
        document.getElementById("frontLeaderboardBox");

    if (leaderboardList === null || leaderboardBox === null) {
        return;
    }

    leaderboardList.innerHTML =
        "<li>Indlæser leaderboard...</li>";

    let leaderboardEnabled =
        true;

    try {

        const settingsResponse =
            await axios.get(
                apiUrl + "/Settings"
            );

        const settings =
            settingsResponse.data;

        for (let index = 0; index < settings.length; index++) {

            const setting =
                settings[index];

            if (setting.key !== undefined &&
                setting.key !== null &&
                setting.key.toLowerCase() === "leaderboard") {

                leaderboardEnabled =
                    setting.value;
            }
        }
    }

    catch(error) {

        console.log(error);

        leaderboardEnabled =
            true;
    }

    if (leaderboardEnabled === false) {

        leaderboardBox.style.display =
            "none";

        return;
    }

    try {

        const response =
            await axios.get(
                apiUrl + "/Leaderboard/schools?roadType=Byzone"
            );

        const leaderboard =
            response.data;

        leaderboardList.innerHTML =
            "";

        if (leaderboard.length === 0) {

            leaderboardList.innerHTML =
                "<li>Ingen leaderboard data fundet</li>";

            return;
        }

        for (let index = 0; index < leaderboard.length; index++) {

            const school =
                leaderboard[index];

            const averageCo2 =
                getLeaderboardValue(
                    school.averageCo2,
                    school.avgCo2,
                    school.co2,
                    school.totalCo2
                );

            let scoreClass =
                "green";

            if (averageCo2 > 25) {
                scoreClass = "yellow";
            }

            if (averageCo2 > 35) {
                scoreClass = "red";
            }

            leaderboardList.innerHTML +=
                "<li>" +
                    "<div class='left'>" +
                        "<div class='rank'>" + (index + 1) + "</div>" +
                        safeText(getLeaderboardName(school)) +
                    "</div>" +
                    "<span class='" + scoreClass + "'>" +
                        averageCo2 + " g CO₂ 🌱" +
                    "</span>" +
                "</li>";
        }
    }

    catch(error) {

        console.log(error);

        leaderboardList.innerHTML =
            "<li>Kunne ikke hente leaderboard</li>";
    }
}


// Henter leaderboard navn med fallback.
function getLeaderboardName(item) {

    if (item.schoolName !== undefined && item.schoolName !== null) {
        return item.schoolName;
    }

    if (item.school !== undefined && item.school !== null) {
        return item.school;
    }

    if (item.name !== undefined && item.name !== null) {
        return item.name;
    }

    return "---";
}


// Henter leaderboard værdi med fallback.
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

    return 0;
}


// Forhindrer tom tekst.
function safeText(text) {

    if (text === undefined || text === null || text === "") {
        return "---";
    }

    return text;
}


// Starter Enter funktion på forsiden.
setupFrontPageEnterKey();