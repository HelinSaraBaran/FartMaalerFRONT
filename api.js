// This file contains shared API settings and helper methods.

const apiUrl = "https://fartmaalerapi20260511134506-fnarawbzewapckck.switzerlandnorth-01.azurewebsites.net/api";

// Saves teacher token after login.
function saveToken(token) {

    localStorage.setItem(
        "token",
        token
    );
}

// Gets teacher token from localStorage.
function getToken() {

    return localStorage.getItem(
        "token"
    );
}

// Checks if teacher is logged in.
function isTeacherLoggedIn() {

    const token =
        getToken();

    if (token === null || token === "") {

        return false;
    }

    return true;
}

// Logs teacher out and sends teacher back to login page.
function logout() {

    localStorage.removeItem(
        "token"
    );

    window.location.href =
        "index.html";
}

// Protects teacher pages from being opened without login.
function protectTeacherPage() {

    if (isTeacherLoggedIn() === false) {

        window.location.href =
            "teacher-login.html";
    }
}

// Adds JWT token to protected API requests.
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

// Handles API errors in one shared place.
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

            showError(
                "Du er ikke logget ind eller din adgang er udløbet."
            );

            localStorage.removeItem(
                "token"
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

// Shows error messages to the user.
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

// Clears visible error messages.
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