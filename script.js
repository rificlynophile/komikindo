const btn = document.getElementById("toggle");
btn.onclick = () => {
  document.body.classList.toggle("dark");
  btn.textContent = document.body.classList.contains("dark") ? "☀️ Light" : "🌙 Dark";
};
