let karteAktiv = false;
let map;
let marker;

function toggleKarte() {
  const desk = document.getElementById("desk");
  const karteContainer = document.getElementById("karteContainer");

  karteAktiv = !karteAktiv;

  if (karteAktiv) {
    desk.style.display = "none";
    karteContainer.style.display = "block";
    initMap();
  } else {
    karteContainer.style.display = "none";
    desk.style.display = "block";
  }
}

function initMap() {
  try {
    if (map) {
      console.log("Karte wurde bereits geladen.");
      return;
    }

    console.log("Initialisiere Karte...");

    const position = [50.9375, 6.9603]; // Köln
    map = L.map('karte').setView(position, 13);

    console.log("Tile Layer wird geladen...");
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    console.log("Marker wird hinzugefügt...");
    marker = L.marker(position).addTo(map).bindPopup("Du bist hier").openPopup();

    // Optional: Firebase einbinden
    if (typeof firebase !== "undefined" && firebase.auth) {
      console.log("Firebase erkannt.");

      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          const uid = user.uid;
          console.log("Benutzer angemeldet:", uid);

          // Position speichern
          firebase.database().ref("positions/" + uid).set({
            lat: position[0],
            lng: position[1]
          });

          // Andere Spieler laden
          firebase.database().ref("positions").once("value").then(snapshot => {
            snapshot.forEach(child => {
              const data = child.val();
              const isSelf = child.key === uid;
              if (!isSelf && data.lat && data.lng) {
                console.log("Anderer Spieler:", data);
                L.circleMarker([data.lat, data.lng], {
                  radius: 8,
                  color: "blue",
                  fillColor: "blue",
                  fillOpacity: 0.5
                }).addTo(map).bindPopup("Ein anderer Spieler");
              }
            });
          });
        } else {
          console.warn("Kein angemeldeter Benutzer.");
        }
      });
    } else {
      console.warn("Firebase nicht geladen oder nicht verfügbar.");
    }

  } catch (err) {
    console.error("Fehler beim Laden der Karte:", err);
  }
}