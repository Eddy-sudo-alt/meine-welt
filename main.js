const prophecies = [
  "Du wirst ein Held – oder ein Niemand.",
  "Ein Schatten folgt dir seit deiner Geburt.",
  "Du wirst zwischen zwei Welten wandeln.",
  "In deinem Blut liegt eine vergessene Macht.",
  "Du wirst den Lauf der Dinge verändern."
];

const auth = firebase.auth();
const db = firebase.database();

const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const registerBtn = document.getElementById("register");
const loginBtn = document.getElementById("login");
const message = document.getElementById("message");

function showMessage(text) {
  message.textContent = text;
}

// Registrierung
registerBtn.onclick = async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  if (!username || !password) return showMessage("Felder ausfüllen");

  const email = username + "@spiel.de";
  const prophecy = prophecies[Math.floor(Math.random() * prophecies.length)];

  try {
    await auth.createUserWithEmailAndPassword(email, password);
    await db.ref("users/" + auth.currentUser.uid).set({ username, prophecy, introSeen: false });
    showMessage("Registrierung erfolgreich!");
  } catch (error) {
    showMessage(error.message);
  }
};

// Login
loginBtn.onclick = async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value;
  const email = username + "@spiel.de";

  try {
    await auth.signInWithEmailAndPassword(email, password);
    showMessage("Login erfolgreich!");
    setTimeout(() => {
      const user = auth.currentUser;
      const uid = user.uid;
      const userRef = db.ref("users/" + uid);

      userRef.once("value").then(snapshot => {
        const data = snapshot.val();
        if (data && data.introSeen) {
          window.location.href = "spiel.html";
        } else {
          window.location.href = "intro.html";
        }
      });
    }, 1000);
  } catch (error) {
    showMessage("Login fehlgeschlagen: " + error.message);
  }
};
