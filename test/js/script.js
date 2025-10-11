// Validación de contraseñas en registro
document.addEventListener("DOMContentLoaded", () => {
  const formRegistro = document.getElementById("formRegistro");
  const formLogin = document.getElementById("formLogin");

  // --- Registro ---
  if (formRegistro) {
    formRegistro.addEventListener("submit", (e) => {
      e.preventDefault();
      const pass1 = document.getElementById("password").value;
      const pass2 = document.getElementById("password2").value;

      if (pass1 !== pass2) {
        alert("Las contraseñas no coinciden");
        return;
      }

      alert("✅ Registro exitoso");
      formRegistro.reset();
      window.location.href = "login.html"; // redirige al login
    });
  }

  // --- Login ---
  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      // Redirige directamente a la página principal
      window.location.href = "index.html";
    });
  }
});

// --- Redirecciones del menú ---
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("nav ul li a").forEach(link => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const href = link.getAttribute("href");

      // Evita recargar la misma página
      if (href && href !== "#") {
        window.location.href = href;
      }
    });
  });
});
