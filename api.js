// Denne fil indeholder fælles API indstillinger og hjælpe metoder.

const apiUrl = "https://faartmaalerv2-fzgub9frhhb2ckb9.switzerlandnorth-01.azurewebsites.net/api";

let requestIsRunning = false;

// Gemmer underviser token efter login.
function saveToken(token) {

    localStorage.setItem(
        "token",
        token
    );
}

// Henter underviser token fra localStorage.
function getToken() {

    return localStorage.getItem(
        "token"
    );
}

// Tjekker om underviser er logget ind.
function isTeacherLoggedIn() {

    const token =
        getToken();

    if (token === null || token === "") {

        return false;
    }

    return true;
}

// Logger underviser ud og sender underviser tilbage til login siden.
function logout() {

    localStorage.removeItem(
        "token"
    );

    window.location.href =
        "index.html";
}

// Beskytter underviser sider, så de ikke kan åbnes uden login.
function protectTeacherPage() {

    if (isTeacherLoggedIn() === false) {

        window.location.href =
            "teacher-login.html";
    }
}

// Tilføjer JWT token til beskyttede API kald.
axios.interceptors.request.use(
    function(config) {

        const token =
            getToken();

        if (token !== null && token !== "") {

            config.headers.Authorization =
                "Bearer " + token;
        }

        return config;
    },
    function(error) {

        showError(
            "Der opstod en fejl før forespørgslen blev sendt."
        );

        return Promise.reject(
            error
        );
    }
);

// Håndterer API fejl samlet.
axios.interceptors.response.use(
    function(response) {

        return response;
    },
    function(error) {

        if (error.response === undefined) {

            showError(
                "API'et svarer ikke. Tjek internetforbindelse eller server."
            );
        }
       else if (error.response.status === 401) {

    localStorage.removeItem(
        "token"
    );

    const currentPage =
        window.location.pathname.split("/").pop();

    if (currentPage === "teacher-login.html") {

        showError(
            "Forkert brugernavn eller adgangskode."
        );

        return Promise.reject(
            error
        );
    }

    showError(
        "Du er ikke logget ind eller din adgang er udløbet."
    );

    window.location.href =
        "teacher-login.html";
}
        else if (error.response.status === 403) {

            showError(
                "Du har ikke adgang til denne funktion."
            );
        }
        else if (error.response.status === 404) {

            console.log(
                "Data blev ikke fundet."
            );
        }
        else if (error.response.status >= 500) {

            showError(
                "Der opstod en serverfejl."
            );
        }

        return Promise.reject(
            error
        );
    }
);

// Viser fejl beskeder til brugeren.
function showError(message) {

    const errorBox =
        document.getElementById(
            "errorBox"
        );

    if (errorBox !== null) {

        errorBox.innerText =
            message;

        errorBox.style.display =
            "block";
    }
    else {

        alert(
            message
        );
    }
}

// Fjerner synlige fejl beskeder.
function clearError() {

    const errorBox =
        document.getElementById(
            "errorBox"
        );

    if (errorBox !== null) {

        errorBox.innerText =
            "";

        errorBox.style.display =
            "none";
    }
}

// Gør så man kan trykke Enter i et input felt.
function setupEnterKey(inputId, functionToRun) {

    const inputElement =
        document.getElementById(
            inputId
        );

    if (inputElement === null) {
        return;
    }

    inputElement.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {

            event.preventDefault();

            functionToRun();
        }
    });
}

// Gør så man kan trykke Enter i flere input felter.
function setupEnterKeyForMultipleInputs(inputIds, functionToRun) {

    for (let index = 0; index < inputIds.length; index++) {

        setupEnterKey(
            inputIds[index],
            functionToRun
        );
    }
}

// Forhindrer at samme handling kører flere gange på samme tid.
async function runSafeAsync(functionToRun) {

    if (requestIsRunning === true) {
        return;
    }

    requestIsRunning =
        true;

    try {

        await functionToRun();
    }
    finally {

        requestIsRunning =
            false;
    }
}