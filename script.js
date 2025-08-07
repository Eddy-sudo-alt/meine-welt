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
  if (map) return; // Karte wurde schon initialisiert

  // Zufälliger Dummy-Standort (z. B. Köln)
  const lat = 50.9375 + Math.random() * 0.01;
  const lng = 6.9603 + Math.random() * 0.01;
  const position = [lat, lng];

  map = L.map('karte').setView(position, 15);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
  }).addTo(map);

  marker = L.marker(position).addTo(map).bindPopup("Du bist hier").openPopup();

  // Speichere Standort in Firebase
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      const uid = user.uid;
      firebase.database().ref("positions/" + uid).set({ lat, lng });

      // Lade andere Spieler
      firebase.database().ref("positions").once("value").then(snapshot => {
        snapshot.forEach(child => {
          const data = child.val();
          const isSelf = child.key === uid;
          if (!isSelf) {
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