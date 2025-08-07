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

    // Karte nur einmal initialisieren
    if (!map) {
      console.log("🗺️ Karte wird initialisiert...");
      initMap();
    }

    // Leaflet neu rendern, nachdem DOM sichtbar ist
    setTimeout(() => {
      if (map) {
        map.invalidateSize();
        map.setView(map.getCenter());
        console.log("✅ Karte neu gerendert");
      }
    }, 300);
  } else {
    karteContainer.style.display = "none";
    desk.style.display = "block";
  }
}

function initMap() {
  try {
    const position = [50.9375, 6.9603]; // Dummy: Köln
    map = L.map('karte').setView(position, 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    marker = L.marker(position).addTo(map).bindPopup("Du bist hier").openPopup();

    // Firebase: Position speichern & andere Spieler anzeigen
    if (typeof firebase !== "undefined" && firebase.auth) {
      firebase.auth().onAuthStateChanged(user => {
        if (user) {
          const uid = user.uid;

          // Eigene Position speichern
          firebase.database().ref("positions/" + uid).set({
            lat: position[0],
            lng: position[1]
          });

          // Andere Spieler anzeigen
          firebase.database().ref("positions").once("value").then(snapshot => {
            snapshot.forEach(child => {
              const data = child.val();
              const isSelf = child.key === uid;
              if (!isSelf && data.lat && data.lng) {
                L.circleMarker([data.lat, data.lng], {
                  radius: 8,
                  color: "blue",
                  fillColor: "blue",
                  fillOpacity: 0.5
                }).addTo(map).bindPopup("Ein anderer Spieler");
              }
            });
          });
        }
      });
    }

  } catch (error) {
    console.error("❌ Fehler beim Initialisieren der Karte:", error);
  }
}
function zeigeBereich(bereich) {
  const desk = document.getElementById("desk");
  const karte = document.getElementById("karteContainer");
  const person = document.getElementById("personPanel");

  // Alles ausblenden
  desk.style.display = "none";
  if (karte) karte.style.display = "none";
  if (person) person.style.display = "none";

  if (bereich === "person") {
    person.style.display = "block";
    ladePersonDaten();
  }
}

function ladePersonDaten() {
  const uid = firebase.auth().currentUser?.uid;
  if (!uid) return;

  const ref = firebase.database().ref("users/" + uid + "/person");

  ref.once("value").then(snapshot => {
    const data = snapshot.val() || {
      name: "Unbekannt",
      anschrift: "Keine",
      eigenschaften: {
        stärke: 20,
        intelligenz: 35,
        ausdauer: 10
      }
    };

    // Werte anzeigen
    document.getElementById("charName").textContent = data.name;
    document.getElementById("charAddress").textContent = data.anschrift;
    document.getElementById("stärkeBar").style.width = data.eigenschaften.stärke + "%";
    document.getElementById("intelligenzBar").style.width = data.eigenschaften.intelligenz + "%";
    document.getElementById("ausdauerBar").style.width = data.eigenschaften.ausdauer + "%";
  });
}