@echo off
title Indice de Visibilidade Cognitiva
cd /d "%~dp0"
set ALLOW_PRIVATE=1
start "" http://localhost:3210
node server.js
pause