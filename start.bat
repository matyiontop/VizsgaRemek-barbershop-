@echo off
echo Nemeth Fodraszat Rendszer Inditasa...
start "Backend Szerver" /D "Backend" node index
start "Frontend Alkalmazas" /D "Frontend" npm run dev
exit