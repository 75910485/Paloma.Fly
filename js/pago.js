document.addEventListener("DOMContentLoaded", () => {
    const compraInfoJSON = localStorage.getItem('compraPalomasFly');

    if (!compraInfoJSON) {
        alert("No se encontraron detalles de la compra. Redirigiendo a destinos.");
        window.location.href = "destinos.html";
        return;
    }

    const compraInfo = JSON.parse(compraInfoJSON);

    document.getElementById('resumen-origen').textContent = compraInfo.origen;
    document.getElementById('resumen-destino').textContent = compraInfo.destino;
    document.getElementById('resumen-fecha').textContent = compraInfo.fecha.replace(/-/g, ' de '); 
    document.getElementById('resumen-hora').textContent = compraInfo.hora;
    document.getElementById('resumen-asientos').textContent = `Asiento: ${compraInfo.asientos}`;
    document.getElementById('resumen-precio').textContent = `S/${compraInfo.precioTotal}`;
    
    document.getElementById('resumen-pasajero-nombre').textContent = "Lucas Condori"; 
    
    document.querySelector('.btn-pagar-final').addEventListener('click', (e) => {
        e.preventDefault(); 
        
        const numeroTarjeta = document.getElementById('numeroTarjeta').value;
        const fechaVencimiento = document.getElementById('fechaVencimiento').value;
        const cvv = document.getElementById('cvv').value;

        if (numeroTarjeta && fechaVencimiento && cvv) {
            alert(`¡Pago de S/${compraInfo.precioTotal} realizado con éxito!`);
            localStorage.removeItem('compraPalomasFly');
        } else {
            alert("Por favor, completa todos los campos de la tarjeta para pagar.");
        }
    });
});