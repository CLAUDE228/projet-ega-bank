# Ega Bank

Application full-stack de gestion bancaire avec:
- backend Spring Boot securise par JWT
- frontend Angular
 - base MySQL/MariaDB (XAMPP/phpMyAdmin)
- collection Postman pour tester les APIs

## Backend

Principales APIs:
- `POST /api/auth/login`
- `GET|POST|PUT|DELETE /api/clients`
- `GET|POST|PUT|DELETE /api/accounts`
- `POST /api/accounts/{id}/deposit`
- `POST /api/accounts/{id}/withdraw`
- `POST /api/accounts/transfer`
- `GET /api/accounts/{id}/transactions?start=YYYY-MM-DD&end=YYYY-MM-DD`
- `GET /api/accounts/{id}/statement?start=YYYY-MM-DD&end=YYYY-MM-DD`

Compte de demonstration:
- utilisateur: `admin`
- mot de passe: `admin123`

## Frontend

Le frontend Angular consomme le backend sur `http://localhost:8080` et propose:
- authentification
- creation de clients
- creation de comptes
- versement, retrait, virement
- consultation d'historique
- impression du releve PDF

## Execution

Backend:
- lancer `./start-backend.ps1`
- ou depuis le dossier `backend` :
```powershell
mvn spring-boot:run
```
L'application utilisera une base MySQL/MariaDB nommée `egabank`. Si elle n'existe pas, Spring peut la créer automatiquement (option `createDatabaseIfNotExist=true`).
Assurez-vous que votre serveur XAMPP (MySQL/MariaDB) est démarré et que `phpMyAdmin` est accessible.

Par défaut la configuration dans `backend/src/main/resources/application.yml` utilise :

```yaml
spring:
	datasource:
		url: jdbc:mysql://localhost:3306/egabank?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
		username: root
		password: ""
```

Modifiez `username`/`password` si votre installation XAMPP utilise d'autres identifiants.

Après le premier démarrage, la base sera préremplie avec 10 clients, 10 comptes et 10 transactions de démonstration.

Frontend:
- se placer dans `frontend`
- lancer `npm start`
- ou depuis la racine `./start-frontend.ps1`

L'interface a maintenant un écran d'accueil animé (splash) visible à l'ouverture.

## Verification effectuee

- test backend: `mvn test` via Maven local telecharge
- build frontend: `npm run build`