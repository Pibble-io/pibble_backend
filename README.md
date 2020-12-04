### Installation: 
   
    - install: git, nodejs, pm2, yarn, ffmpeg and mysql (npm packages globally)
    - create database 'pibble'
    - clone project
   
    API:
    - $ cp .env.example .env
    - configure db connection and JWT_ACCESS_SECRET, JWT_REFRESH_SECRET, JWT_SECONDARY_SECRET
    - configure SILENT_MODE and DEBUG in .env file (SILENT_MODE true value activates Silent Mode, so that emails and sms don't get sent out the site, DEBUG true activating dev seeds)
    - $ yarn install
    - $ yarn db:setup
    - $ yarn dev

    API will be available on http://{yourserverurl}:4001
   
### API Docs:
    Check {repo}/docs/postman_collection_{N}.json
    Postman vars: 
        - API_URL - API url
        - TOKEN - auth jwt token, can be obtained through /auth/sign-up or /auth/sign-in