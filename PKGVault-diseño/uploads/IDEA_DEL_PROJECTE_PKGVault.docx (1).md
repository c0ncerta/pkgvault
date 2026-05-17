**GUIÓ DEL PROJECTE: DESENVOLUPAMENT APPS AMB TECNOLOGIES WEB**

**Disseny i realització del Projecte**  
   
Es tracta de la creació i divulgació d'un projecte professional, s'aconsella que el producte sigui triat pels alumnes com emprenedors o per a buscar treball com a mostra real de producte.

Portarem a terme les tasques de: dissenyar i realitzar una proposta operativa de l’aplicació, perquè l'alumne pugui aplicar el màxim de coneixement adquirits al curs.

Es presentarà una còpia en format digital del projecte funcional i una adreça web del projecte final.

**Partides de treball**  
Memòria descriptiva del projecte \-\> Entregable

* Definició del projecte: breafing amb definició, objectiu principal del projecte, objectius específics (Com funcionarà l’aplicació), investigació competència (enllaços i virtuts \- oportunitats, target o usuaris potencials.

Nom del projecte: PKGVault (catàleg privat de paquets PKG)

Definició breu: Web app per guardar i catalogar arxius .pkg (paquets d’instal·lació) amb metadades i control d’accés (comptes).

Què és un PKG: Fitxer contenidor que agrupa dades per instal·lar una aplicació/joc en sistemes PlayStation. En el projecte es tracta com un “asset” tècnic a catalogar.

Objectiu principal: Permetre pujar, emmagatzemar (privat), consultar i gestionar un inventari de PKG amb informació (títol, versió, mida, hash, compatibilitat).

Objectius específics : Registre/login (sessions) i perfil bàsic.

CRUD d’ítems del catàleg (títol, descripció, plataforma, versió, firmware mínim, regió, tags).

Pujada d’arxiu .pkg (privat): guardar el fitxer al servidor i la ruta \+ metadades a MySQL.

Validacions (mida màxima, extensió .pkg, camps obligatoris) \+ missatges d’error clars.

Calcular i guardar hash (SHA-256) per verificar integritat.

Llistat \+ cerca simple (text) \+ filtre bàsic per plataforma/versió.

Rol admin opcional: esborrar entrades/reportes (molt simple).

Competència (inspiració, no igual):

RAWG/IGDB: bases de dades de metadades (no guarden fitxers).

Google Drive/Dropbox: guarden fitxers (sense fitxa tècnica especialitzada).

Oportunitat: unir “fitxa tècnica \+ fitxer \+ integritat (hash)” en una app simple.

Target: usuaris que volen organitzar la seva col·lecció privada (ús personal) i tenir control de versions/integritat.

* Arquitectura de la informació. Mapa mental, Arbre de navegació, wireframes. Prototipat

Sitemap: Home · Catàleg · Detall PKG · Pujar PKG · Login/Registre · Perfil · (Admin)

Wireframes mínims (MVP): Home, Catàleg (llistat), Detall, Pujar (formulari \+ upload), Login.

* Breu descripció de la imatge corporativa aplicada. Colors, Tipografies, components.

Imatge corporativa (simple): estil tècnic, fons fosc, accent verd.

Colors (hex): \#0B0F19 fons · \#121A2A superfície · \#1DB954 primari · \#E6EAF2 text · \#FF4D4F error.

Tipografia: Inter / system-ui. Components: card, botons, alerts, formularis.

* Creació bàsica del sistema de disseny amb colors rgb o hexadecimals,

* Tipografies, jerarquia, buttons, i components necessaris

Sistema de disseny (mínim): H1/H2/Body, botó primari/segonari, inputs amb focus visible, alerts success/error.

Disseny de l’estructura de continguts  i prototipat-\>Entregable la documentació constatable del procés)

* AI \- Definir l'estructura de navegació amb wireframes, i mockups. El mapa web ha de mostrar com es relacionen els diferents apartats i quins elements es proporcionen per poder accedir a ells. 

* Mockup navegable.

* Prototip funcional \-\> html, Css, js

Mockup navegable: flux Login → Catàleg → Detall → Pujar PKG.

Prototip funcional (HTML/CSS/JS): maquetació responsive \+ validació client-side del formulari de pujada.

Desenvolupament de l’app en entorn client, servidor i persistència-\>Entregable

Desenvolupament: HTML/CSS/JS \+ PHP (POO) \+ MySQL.

Emmagatzematge: el fitxer .pkg es guarda al servidor (carpeta /uploads) amb nom únic; a MySQL es guarda la ruta, mida i hash.

BBDD (mínim): users, pkgs, tags, pkg\_tags (opcional).

CRUD: pkgs (usuari) \+ esborrat (admin o propietari).

Seguretat bàsica: password\_hash, validació server-side, permisos (només propietari pot descarregar).

* Creació Html, Css, Javascript de client necessari

* Creació i gestió de BBDD amb MYSQL

* Gestió de CRUD bàsic amb Php POO i MYSQL 

* Consum de dades amb APIS de tercers, Javascript i Php

API de tercers (simple per complir requisit): consulta a RAWG (o similar) per autocompletar portada i gènere quan l’usuari escriu el títol (opcional).

* Publicació i control de versions

Versions: Git (commits per funcionalitat). Publicació: hosting PHP+MySQL \+ URL.

**Presentació i defensa del projecte realitzat**

Defensa (demo): registre/login → pujar PKG (validacions \+ hash) → veure’l al catàleg → entrar al detall → descarregar (només propietari).

