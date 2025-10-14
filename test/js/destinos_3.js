document.addEventListener("DOMContentLoaded", () => {
    // Precio base para Cusco (ajustado a S/65 como se indica en el HTML)
    const precioPorAsiento = 65; 
    
    const asientosPiso1 = [
        "01", "04", "", "07", "10",
        "02", "05", "", "08", "11",
        "03", "06", "", "09", "12"
    ];

    const asientosPiso2 = [
        "13", "16", "", "19", "22",
        "14", "17", "", "20", "23",
        "15", "18", "", "21", "24"
    ];

    // FUNCIÓN CLAVE: Define asientos ocupados diferentes para cada viaje a Cusco
    function getOccupiedSeats(cardIndex) {
        switch (cardIndex) {
            case 0: // Viaje 1 (8:00 AM)
                return { 
                    piso1: ["03", "06", "11"], // Bloquea 03, 06, 11
                    piso2: ["14", "19", "24"] 
                };
            case 1: // Viaje 2 (2:00 PM)
                return { 
                    piso1: ["01", "07", "12"], 
                    piso2: ["13", "15", "20", "22"] 
                };
            case 2: // Viaje 3 (8:00 PM)
                return { 
                    piso1: ["04", "05", "08", "10"], // Más asientos bloqueados
                    piso2: ["16", "17", "18", "21"] 
                };
            default:
                return { piso1: [], piso2: [] };
        }
    }

    // RENDERIZADO DEL MAPA (Mantiene la lógica de selección y ocupación)
    function renderizarMapa(mapaContenedor, asientosBase, asientosSeleccionados, cardIndex) {
        mapaContenedor.innerHTML = '';
        const occupied = getOccupiedSeats(cardIndex); 
        const occupiedCurrentPiso = asientosBase === asientosPiso1 ? occupied.piso1 : occupied.piso2;
        
        for (let i = 0; i < asientosBase.length; i++) {
            const num = asientosBase[i];

            if (num === "") {
                const pasillo = document.createElement("div");
                pasillo.classList.add("pasillo-espacio");
                mapaContenedor.appendChild(pasillo);
            } else {
                const asiento = document.createElement("div");
                asiento.classList.add("asiento");
                asiento.setAttribute("data-num", num);
                asiento.textContent = num;

                if (asientosSeleccionados.includes(num)) {
                    asiento.classList.add("seleccionado");
                }

                // Aplica la clase 'ocupado' si está en la lista de asientos bloqueados para este viaje
                if (occupiedCurrentPiso.includes(num)) {
                    asiento.classList.add("ocupado");
                }

                mapaContenedor.appendChild(asiento);
            }
        }

        // Simbolos de bus (Conductor, Baño) - solo en el 1er piso
        if (asientosBase === asientosPiso1) {
            const conductor = document.createElement("div");
            conductor.classList.add("simbolo-bus");
            conductor.setAttribute("title", "Asiento Conductor");
            conductor.innerHTML = '<i class="fa-solid fa-person"></i>';
            mapaContenedor.appendChild(conductor);

            const bano = document.createElement("div");
            bano.classList.add("simbolo-bus");
            bano.setAttribute("title", "Baño");
            bano.innerHTML = '<i class="fa-solid fa-toilet"></i>';
            mapaContenedor.appendChild(bano);
        }
    }
    
    // Función para manejar el estado de cada tarjeta (se mantiene igual)
    function getCardState(card) {
        if (!card.state) {
            card.state = {
                pisoActual: '1',
                piso1: [], 
                piso2: [] 
            };
        }
        return card.state;
    }

    // Función de resumen (con destino Cusco y precio actualizado)
    function actualizarResumen(card) {
        const state = getCardState(card);
        const seleccionadosTotal = [...state.piso1, ...state.piso2];

        const ladoDerecho = card.querySelector(".lado-der");
        const lista = ladoDerecho.querySelector(".seleccionados");
        const total = ladoDerecho.querySelector(".precio-total");
        const cantidadAsientos = ladoDerecho.querySelector(".asientos-texto");

        lista.innerHTML = ""; 

        if (seleccionadosTotal.length === 0) {
            lista.textContent = "Ninguno";
            total.textContent = "S/0.00";
            cantidadAsientos.textContent = "*0 asientos";
        } else {
            seleccionadosTotal.sort((a, b) => parseInt(a) - parseInt(b)).forEach(num => {
                const asientoNum = document.createElement("div");
                asientoNum.classList.add("asiento-num");
                asientoNum.textContent = num;
                lista.appendChild(asientoNum);
            });

            const precioFinal = seleccionadosTotal.length * precioPorAsiento;
            total.textContent = `S/${precioFinal.toFixed(2)}`;
            cantidadAsientos.textContent = `*${seleccionadosTotal.length} asientos`;
        }

        // Información guardada para la página de pago
        card.compraInfo = {
            origen: "Lima(Atocongo)",
            destino: "Cusco", // CAMBIO IMPORTANTE: Destino Cusco
            fecha: document.querySelector('.busqueda input[type="text"][value="11-Sep-25"]').value, 
            hora: card.querySelector('.info-viaje .izquierda span').textContent.split("→")[0].trim(),
            asientos: seleccionadosTotal.join(", "),
            precioTotal: (seleccionadosTotal.length * precioPorAsiento).toFixed(2)
        };
    }
    
    // INICIALIZACIÓN DE TODAS LAS TARJETAS Y MANEJO DE EVENTOS
    const allCards = document.querySelectorAll(".card");
    
    allCards.forEach((card, index) => { 
        const mapaContenedor = card.querySelector(".mapa-asientos");
        const estadoInicial = getCardState(card);

        // LÓGICA DEL BOTÓN PAGAR
        const pagarBoton = card.querySelector(".pagar");
        if (pagarBoton) {
            pagarBoton.addEventListener("click", () => {
                const seleccionadosTotal = [...estadoInicial.piso1, ...estadoInicial.piso2];
                if (seleccionadosTotal.length > 0) {
                    localStorage.setItem('compraPalomasFly', JSON.stringify(card.compraInfo));
                    window.location.href = "pago.html"; 
                } else {
                    alert("Por favor, selecciona al menos un asiento para continuar con la compra.");
                }
            });
        }
        
        // LÓGICA DEL BOTÓN VER/CERRAR ASIENTOS
        const botonVerAsientos = card.querySelector(".ver-asientos");
        botonVerAsientos.addEventListener("click", () => {
            const seccion = card.querySelector(".asientos");
            const isOculto = seccion.classList.toggle("oculto");

            botonVerAsientos.textContent = isOculto ? "Ver asientos" : "Cerrar";

            if (!isOculto) {
                const piso1Btn = card.querySelector('.piso-btn[data-piso="1"]');
                if (piso1Btn && !piso1Btn.classList.contains("active")) {
                    piso1Btn.click();
                } else {
                    // Renderiza el mapa usando el índice de la tarjeta
                    renderizarMapa(mapaContenedor, asientosPiso1, estadoInicial.piso1, index); 
                    actualizarResumen(card);
                }
            }
        });

        // LÓGICA DE SELECCIÓN DE ASIENTOS
        if (mapaContenedor) {
            mapaContenedor.addEventListener("click", e => {
                // Solo permite seleccionar si es un asiento y NO está ocupado
                if (e.target.classList.contains("asiento") && !e.target.classList.contains("ocupado")) {
                    e.target.classList.toggle("seleccionado");
                    const num = e.target.dataset.num;

                    const currentPisoList = estadoInicial[`piso${estadoInicial.pisoActual}`];
                    const idx = currentPisoList.indexOf(num);

                    if (idx > -1) {
                        currentPisoList.splice(idx, 1);
                    } else {
                        currentPisoList.push(num);
                    }

                    actualizarResumen(card);
                }
            });
        }
        
        // LÓGICA DE CAMBIO DE PISO
        const pisoBtns = card.querySelectorAll(".piso-btn");
        pisoBtns.forEach(btn => {
            btn.addEventListener("click", e => {
                const nuevoPiso = e.target.dataset.piso;

                pisoBtns.forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");

                estadoInicial.pisoActual = nuevoPiso;

                const asientosBase = (nuevoPiso === '1') ? asientosPiso1 : asientosPiso2;
                const asientosSeleccionados = estadoInicial[`piso${nuevoPiso}`];
                
                // Renderiza el mapa usando el índice de la tarjeta
                renderizarMapa(mapaContenedor, asientosBase, asientosSeleccionados, index); 
            });
        });
        
        // Carga inicial
        renderizarMapa(mapaContenedor, asientosPiso1, estadoInicial.piso1, index);
        actualizarResumen(card);
    });
});