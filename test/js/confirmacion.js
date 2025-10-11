document.addEventListener("DOMContentLoaded", () => {
    const compraInfoJSON = localStorage.getItem('compraPalomasFly');

    if (compraInfoJSON) {
        const compraInfo = JSON.parse(compraInfoJSON);
        
        document.getElementById('ruta-origen').textContent = compraInfo.origen.split('(')[0].trim();
        document.getElementById('ruta-destino').textContent = compraInfo.destino;

        
        const dataParaQR = `
            Viaje: ${compraInfo.origen} a ${compraInfo.destino}
            Fecha: ${compraInfo.fecha}
            Hora: ${compraInfo.hora}
            Asientos: ${compraInfo.asientos}
            Total: S/${compraInfo.precioTotal}
            Pasajero: Lucas Condori
        `;
        
        console.log("Contenido del QR simulado:", dataParaQR);



    } else {
        // Si no hay datos, mostrar una ruta genérica y un mensaje
        document.getElementById('ruta-origen').textContent = "Lima";
        document.getElementById('ruta-destino').textContent = "Arequipa";
        console.log("No se encontraron datos de compra en localStorage.");
    }
    
    document.querySelector('.btn-descarga').addEventListener('click', () => {
        alert("Simulando descarga del PDF de la compra...");
    });
});