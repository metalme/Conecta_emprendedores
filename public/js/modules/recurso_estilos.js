// Parallax suave y eficiente
window.addEventListener("scroll", () => {
  const scrollY = window.scrollY;
  const imagen = document.querySelector(".parallax-layer img");

  // Movimiento sutil / ajuste de velocidad
  imagen.style.transform = `translateY(${scrollY * 0.25}px) scale(1.3)`;
});
