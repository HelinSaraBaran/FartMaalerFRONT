# Smart Fartmåler 🚗🌿

Smart Fartmåler er et interaktivt undervisningsprojekt, som hjælper elever med at forstå sammenhængen mellem hastighed, præcision, data og CO₂-udledning gennem praktiske fartmålinger.

Systemet kombinerer hardware, backend, frontend og database i én samlet løsning, hvor elever kan gennemføre målinger og undervisere kan administrere data, grupper og resultater.

Formålet med projektet er at gøre læring om fart, data og bæredygtighed mere praktisk, motiverende og visuelt for elever gennem interakitv teknologi. 

---

# 📚 Funktioner

## Elev funktioner
- Starte nye sessioner
- Vælge gruppe, biltype og vejtype
- Se hastighed, distance, tid og CO₂
- Se historik og tidligere målinger
- Filtrere og sortere målinger
- Se leaderboard og score

## Underviser funktioner
- Login med JWT authentication
- Administrere grupper
- Se sessioner og målinger
- Se live overblik
- Leaderboard over grupper og skoler
- Administrere indstillinger

---

# 🛠 Teknologier

Projektet er bygget med:

- C#
- ASP.NET Core Web API
- Entity Framework Core
- SQL Server / Azure SQL
- HTML
- CSS
- JavaScript
- Vue.js
- Axios
- JWT Authentication
- Selenium
- xUnit
- GitHub Actions
- Azure App Service

---

# 🧠 Hvordan virker systemet?

1. Eleven vælger gruppe, biltype og vejtype
2. En bil køres gennem målebanen
3. Sensorer registrerer tiden
4. Systemet beregner hastighed ud fra distance og tid
5. Resultatet sendes til backend API’et
6. Data gemmes i databasen
7. Frontend viser score, CO₂ og feedback

---

# 🚀 Sådan startes projektet

## Backend
Åbn backend projektet i Visual Studio og start API’et.
Swagger bruges til at teste endpoints.

---
## Frontend
Åbn frontend mappen i VS Code
Start projektet med Live Server fra:

http://127.0.0.1:5500/index.html

---
## Login 
For at kunne logge ind bruges:
Brugernavn: admin
Adgangskode: admin123

--- 
## Tests 
Projektet indeholder:  
Selenium tests og xUnit test 
Testene findes i backend projektet 

--- 
## Deployment 
Projektet deployes med:
- Azure App Service
- Azure SQL Database
- GitHub Actions CI/CD


--- 
## Udviklet af: 
Projektet er udviklet af 
Aastha Kumar, Dewran Koc, Eylem Yilmaz, Helin S. Baran og Julia J. Pawlaczyk

Zealand Datamatiker - 3. semester projekt. 