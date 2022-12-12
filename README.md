#Setup

##Database
1. Setup a Database (recommended mySQL)
2. Update the connection URL in the .env file (You can rename .env.template and replace the example values)
3. Execute `npx prisma migrate dev --name init` in project root for migrations