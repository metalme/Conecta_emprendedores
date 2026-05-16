document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById('registro_formulario');
  const passwordInput = document.getElementById('password'); 
  
  // ==========================================
  // ¡AQUÍ ESTABA EL ERROR! Faltaba declarar esta constante:
  // ==========================================
  const togglePassword = document.getElementById('toggle-password'); 

  // Elementos de la interfaz para los requisitos de contraseña
  const reqLength = document.getElementById("req-length");
  const reqUpper = document.getElementById("req-upper");
  const reqNumber = document.getElementById("req-number");
  const reqSpecial = document.getElementById("req-special");

  // ==========================================
  // LÓGICA DEL OJO (MOSTRAR / OCULTAR)
  // ==========================================
  if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Intercambiar el tipo de input
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      
      // Cambiar el emoji de apoyo visual
      togglePassword.textContent = type === 'password' ? '👁' : '🙈'; 
    });
  }   
  
  // ==========================================
  // CAMBIO 1: VALIDACIÓN VISUAL EN TIEMPO REAL
  // ==========================================
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      const value = passwordInput.value;

      // Validar largo (mínimo 10)
      if (value.length >= 10) {
        reqLength.textContent = "✔ Mínimo 10 caracteres";
        reqLength.className = "valid";
      } else {
        reqLength.textContent = "❌ Mínimo 10 caracteres";
        reqLength.className = "invalid";
      }

      // Validar Mayúscula
      if (/[A-Z]/.test(value)) {
        reqUpper.textContent = "✔ Al menos una letra mayúscula";
        reqUpper.className = "valid";
      } else {
        reqUpper.textContent = "❌ Al menos una letra mayúscula";
        reqUpper.className = "invalid";
      }

      // Validar Número
      if (/\d/.test(value)) {
        reqNumber.textContent = "✔ Al menos un número";
        reqNumber.className = "valid";
      } else {
        reqNumber.textContent = "❌ Al menos un número";
        reqNumber.className = "invalid";
      }

      // Validar Carácter Especial
      if (/[@$!%*?&]/.test(value)) {
        reqSpecial.textContent = "✔ Al menos un carácter especial (@$!%*?&)";
        reqSpecial.className = "valid";
      } else {
        reqSpecial.textContent = "❌ Al menos un carácter especial (@$!%*?&)";
        reqSpecial.className = "invalid";
      }
    });
  }

  // ==========================================
  // ESCUCHAR EL ENVÍO DEL FORMULARIO
  // ==========================================
  if (formulario) {
    formulario.addEventListener('submit', async (e) => {
      e.preventDefault();

      // ==========================================
      // CAMBIO 2: VALIDACIÓN ANTES DE ENVIAR
      // ==========================================
      const pass = passwordInput.value;
      const exprSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$/;
      
      if (!exprSegura.test(pass)) {
        alert("⚠️ Por favor, asegúrate de cumplir con todos los requisitos de la contraseña antes de registrarte.");
        return; 
      }

      const formData = new FormData(formulario);
      const data = Object.fromEntries(formData.entries());

      const API_URL = window.location.origin + '/api/emprendedores';

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
          alert("🎉 ¡Usuario registrado con éxito!");
          formulario.reset();
          
          if(reqLength) {
            [reqLength, reqUpper, reqNumber, reqSpecial].forEach(el => el.className = "invalid");
          }
          
          window.location.href = "/pages/login.html";
        } else {
          if (result.error === 'duplicado_documento') {
            alert("⚠️ Error: El número de documento ya está registrado en el sistema.");
          } else if (result.error === 'duplicado_correo') {
            alert("⚠️ Error: El correo electrónico ya se encuentra en uso.");
          } else {
            alert("Hubo un error: " + (result.mensaje || result.error));
          }
        }
      } catch (error) {
        console.error("No se pudo conectar con el servidor:", error);
        alert("❌ Error de conexión: No se pudo establecer contacto con el servidor.");
      }
    });
  }
});