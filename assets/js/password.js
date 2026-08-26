// CHANGE YOUR PASSWORD HERE
const SECRET_PASSWORD = "tree";

document.addEventListener("DOMContentLoaded", () => {

  // Lock page
  document.body.classList.add("locked");

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "password-overlay";

  overlay.innerHTML = `
    <div class="password-box">
      <h2 class>PAGE HIDDEN</h2>
      <p>To view this page, please reach out to me for the password.</p>
      <input type="password" id="pwInput" placeholder="Secret word">
      <button id="pwButton">Unlock</button>
      <div class="password-error" id="pwError" style="display:none;">Incorrect password</div>
    </div>
  `;

  document.body.appendChild(overlay);

  const input = document.getElementById("pwInput");
  const button = document.getElementById("pwButton");
  const error = document.getElementById("pwError");

  function tryUnlock() {
    if (input.value.trim() === SECRET_PASSWORD) {
      document.body.classList.remove("locked");
      overlay.remove();
    } else {
      error.style.display = "block";
      input.value = "";
    }
  }

  button.addEventListener("click", tryUnlock);

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") tryUnlock();
  });
});
