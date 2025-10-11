// Validación de contraseñas en registro

document.addEventListener("DOMContentLoaded", () => {
  const formRegistro = document.getElementById("formRegistro");
  const formLogin = document.getElementById("formLogin");

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
      window.location.href = "login.html"; // redirige a login
    });
  }

  if (formLogin) {
    formLogin.addEventListener("submit", (e) => {
      e.preventDefault();
      alert("🔐 Inicio de sesión correcto (ejemplo)");
      window.location.href = "index.html"; // redirige al home
    });
  }
});
