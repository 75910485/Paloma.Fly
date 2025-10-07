document.addEventListener("DOMContentLoaded", () => {
    const precioPorAsiento = 39;
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

    function renderizarMapa(mapaContenedor, asientosBase, asientosSeleccionados) {
        mapaContenedor.innerHTML = ''; 
        let seatIndex = 0;

        // Bucle para construir la estructura del mapa
        for (let i = 0; i < asientosBase.length; i++) {
            const num = asientosBase[i];
            
            if (num === "") {
                // Espacio de pasillo
                const pasillo = document.createElement("div");
                pasillo.classList.add("pasillo-espacio");
                mapaContenedor.appendChild(pasillo);
            } else {
                // Asiento
                const asiento = document.createElement("div");
                asiento.classList.add("asiento");
                asiento.setAttribute("data-num", num);
                asiento.textContent = num;
                
                // Aplicar estado 'seleccionado' si ya lo estaba
                if (asientosSeleccionados.includes(num)) {
                    asiento.classList.add("seleccionado");
                }

                //  Asiento '06' del piso 1 siempre ocupado como ejemplo por ahora
                if (num === "06" || num === "18") {
                    asiento.classList.add("ocupado");
                }

                mapaContenedor.appendChild(asiento);
                seatIndex++;
            }
        }
        
        // Símbolos de conductor y baño al final del 1er piso
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
    
    // Función para guardar y recuperar el estado de los asientos por tarjeta
    function getCardState(card) {
        if (!card.state) {
            card.state = {
                pisoActual: '1',
                piso1: [], // Asientos seleccionados en el piso 1
                piso2: []  // Asientos seleccionados en el piso 2
            };
        }
        return card.state;
    }

    // Función para calcular y actualizar el resumen de compra
    function actualizarResumen(card) {
        const state = getCardState(card);
        const seleccionadosTotal = [...state.piso1, ...state.piso2];

        const ladoDerecho = card.querySelector(".lado-der");
        const lista = ladoDerecho.querySelector(".seleccionados");
        const total = ladoDerecho.querySelector(".precio-total");
        const cantidadAsientos = ladoDerecho.querySelector(".asientos-texto");
        
        lista.innerHTML = ""; // Limpiar la lista de burbujas

        if (seleccionadosTotal.length === 0) {
            lista.textContent = "Ninguno";
            total.textContent = "S/0.00";
            cantidadAsientos.textContent = "*0 asientos";
            return;
        }

        // Crear las "burbujas" de asientos seleccionados
        seleccionadosTotal.sort((a, b) => parseInt(a) - parseInt(b)).forEach(num => {
            const asientoNum = document.createElement("div");
            asientoNum.classList.add("asiento-num");
            asientoNum.textContent = num;
            lista.appendChild(asientoNum);
        });

        // Actualizar el precio total y la cantidad de asientos
        total.textContent = `S/${(seleccionadosTotal.length * precioPorAsiento).toFixed(2)}`;
        cantidadAsientos.textContent = `*${seleccionadosTotal.length} asientos`;
    }

    // --- Abrir / cerrar secciones de asientos ---
    document.querySelectorAll(".ver-asientos").forEach(boton => {
        boton.addEventListener("click", () => {
            const card = boton.closest(".card");
            const seccion = card.querySelector(".asientos");
            const mapaContenedor = card.querySelector(".mapa-asientos");
            const state = getCardState(card);

            const isOculto = seccion.classList.toggle("oculto");
            
            boton.textContent = isOculto ? "Ver asientos" : "Cerrar";
            
            if (!isOculto) {
                card.querySelector('.piso-btn[data-piso="1"]').click(); 
                actualizarResumen(card);
            }
        });
    });

    // --- Lógica de selección de asientos ---
    document.querySelectorAll(".card").forEach(card => {
        const mapa = card.querySelector(".mapa-asientos");
        if (mapa) {
            mapa.addEventListener("click", e => {
                if (e.target.classList.contains("asiento") && !e.target.classList.contains("ocupado")) {
                    e.target.classList.toggle("seleccionado");
                    const state = getCardState(card);
                    const num = e.target.dataset.num;

                    // Actualizar el estado del asiento en el piso actual
                    const currentPisoList = state[`piso${state.pisoActual}`];
                    const index = currentPisoList.indexOf(num);

                    if (index > -1) {
                        currentPisoList.splice(index, 1); 
                    } else {
                        currentPisoList.push(num); 
                    }

                    actualizarResumen(card);
                }
            });
        }
    });
    
    // --- Lógica de cambio de piso ---
    document.querySelectorAll(".card").forEach(card => {
        const pisoBtns = card.querySelectorAll(".piso-btn");
        const mapaContenedor = card.querySelector(".mapa-asientos");

        pisoBtns.forEach(btn => {
            btn.addEventListener("click", e => {
                const nuevoPiso = e.target.dataset.piso;
                const state = getCardState(card);

                //Marcar el botón como activo
                pisoBtns.forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");

                //Actualizar el estado del piso actual
                state.pisoActual = nuevoPiso;
                
                //Obtener la lista de asientos base para el nuevo piso
                const asientosBase = (nuevoPiso === '1') ? asientosPiso1 : asientosPiso2;
                
                //Obtener los asientos seleccionados guardados para ese piso
                const asientosSeleccionados = state[`piso${nuevoPiso}`];

                //Renderizar el mapa de asientos con la nueva numeración y selecciones
                renderizarMapa(mapaContenedor, asientosBase, asientosSeleccionados);

            });
        });
        
        // Renderizar el estado inicial (Piso 1) para las tarjetas
        if (mapaContenedor) {
            renderizarMapa(mapaContenedor, asientosPiso1, getCardState(card).piso1);
        }
    });

    // --- Inicializar la primera tarjeta como abierta si quieres replicar la imagen ---
    const firstCardButton = document.querySelector('.resultados .card:first-child .ver-asientos');
    if (firstCardButton && firstCardButton.textContent === "Cerrar") {
         actualizarResumen(firstCardButton.closest(".card"));
    }
});