'use strict';
// Preserve existing bookmarks to the conflict learning path.
const conflictStations=new Set(['start','ord','aarsaker','ww1','mellomkrig','ww2','holocaust','kaldkrig','kriser','kilder','fred','idag','vis','laerer']);
function redirectLegacyStation(){const station=location.hash.slice(1);if(conflictStations.has(station))location.replace('konflikt.html'+location.hash);}
redirectLegacyStation();
window.addEventListener('hashchange',redirectLegacyStation);
