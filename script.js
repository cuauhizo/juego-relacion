const pairs = [
  { programa: 'verde', objeto: 'comp_verde' },
  { programa: 'logistica', objeto: 'comp_logistica' },
  { programa: 'movilidad', objeto: 'comp_movilidad' },
];

// Obtención de elementos clave del DOM
const programasColumn = document.getElementById('programas');
const objetosColumn = document.getElementById('objetos');
const checkButton = document.getElementById('check');
const retryButton = document.getElementById('retry');
const result = document.getElementById('result');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const gameContainer = document.querySelector('.game');

let correctMatches = {}; // Objeto para almacenar relaciones correctas
let currentPrograma = null; // Programa actualmente seleccionado (dragged)
let matchConnections = []; // Almacena las conexiones realizadas entre programa y objeto

// Ajusta el tamaño del canvas para adaptarse al contenedor del juego
function adjustCanvasSize() {
  const gameRect = gameContainer.getBoundingClientRect();
  canvas.width = gameRect.width;
  canvas.height = gameRect.height;
  clearCanvas(); // Limpia el canvas
  redrawLines(); // Redibuja las líneas si ya hay conexiones
}

// Llama a la función para ajustar el canvas cuando la página esté cargada o se redimensione la ventana
window.addEventListener('DOMContentLoaded', adjustCanvasSize);
window.addEventListener('resize', adjustCanvasSize);
window.onload = adjustCanvasSize;

// Función para mezclar (shuffle) los arrays de programas y objetos
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Dibuja una línea entre dos puntos en el canvas
function drawLine(startX, startY, endX, endY) {
  ctx.beginPath();
  ctx.moveTo(startX - canvas.offsetLeft, startY - canvas.offsetTop); // Punto de inicio de la línea
  ctx.lineTo(endX - canvas.offsetLeft, endY - canvas.offsetTop); // Punto final de la línea
  ctx.strokeStyle = '#636569'; // Color de la línea
  ctx.lineWidth = 2; // Grosor de la línea
  ctx.stroke(); // Dibuja la línea
}

// Limpia el contenido del canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Redibuja todas las líneas que conectan los programas con los objetos
function redrawLines() {
  matchConnections.forEach((connection) => {
    const programaRect = connection.programaElement.getBoundingClientRect();
    const objetoRect = connection.objectElement.getBoundingClientRect();
    const gameRect = gameContainer.getBoundingClientRect();

    drawLine(
      programaRect.right - gameRect.left,
      programaRect.top + programaRect.height / 2 - gameRect.top,
      objetoRect.left - gameRect.left,
      objetoRect.top + objetoRect.height / 2 - gameRect.top
    );
  });
}

// Función que genera el juego, mezcla los programas y objetos, y limpia los estados previos
function generateGame() {
  programasColumn.innerHTML = ''; // Limpia la columna de programas
  objetosColumn.innerHTML = ''; // Limpia la columna de objetos
  result.textContent = ''; // Limpia el resultado
  retryButton.style.display = 'none'; // Oculta el botón de reintentar
  correctMatches = {};
  matchConnections = [];
  clearCanvas();

  // Mezcla los programas y objetos
  const shuffledProgramas = shuffle(pairs.map((pair) => pair.programa));
  const shuffledObjetos = shuffle(pairs.map((pair) => pair.objeto));

  // Genera las imágenes de los programas y los agrega al DOM
  shuffledProgramas.forEach((programa) => {
    const img = document.createElement('img');
    img.src = `images/${programa}.jpg`; // Ruta de la imagen del programa
    img.alt = programa;
    img.draggable = true; // Permitir arrastrar el programa
    img.dataset.name = programa; // Almacena el nombre del programa
    img.addEventListener('dragstart', handleDragStart);
    img.addEventListener('touchstart', handleTouchStart, { passive: false });
    img.style.marginTop = `${Math.random() * 30 + 10}px`; // Añade margen aleatorio
    programasColumn.appendChild(img);
  });

  // Genera las zonas donde se pueden soltar los objetos (dropzones)
  shuffledObjetos.forEach((objeto) => {
    const dropzone = document.createElement('div');
    dropzone.classList.add('dropzone'); // Añade la clase 'dropzone'
    dropzone.dataset.name = objeto; // Almacena el nombre del objeto
    dropzone.addEventListener('dragover', handleDragOver);
    dropzone.addEventListener('drop', handleDrop);

    const objetoImg = document.createElement('img');
    objetoImg.src = `images/${objeto}.jpg`; // Ruta de la imagen del objeto
    objetoImg.alt = objeto;
    objetoImg.style.pointerEvents = 'none'; // Desactiva eventos para la imagen del objeto
    dropzone.style.marginTop = `${Math.random() * 30 + 10}px`; // Añade margen aleatorio

    dropzone.appendChild(objetoImg); // Inserta la imagen en la dropzone
    objetosColumn.appendChild(dropzone); // Añade la dropzone al DOM
  });
}

// Función para manejar el inicio del drag (arrastre) de un programa
function handleDragStart(e) {
  currentPrograma = e.target; // Almacena el programa arrastrado
}

// Permite el arrastre sobre las zonas válidas (dropzones)
function handleDragOver(e) {
  e.preventDefault();
}

// Maneja el evento de soltar un programa sobre un objeto
function handleDrop(e) {
  e.preventDefault();
  const objetoName = e.currentTarget.dataset.name; // Obtiene el nombre del objeto

  // Verifica si el programa u objeto ya están relacionados
  const programaRelacionado = matchConnections.find(
    (connection) => connection.programaName === currentPrograma.dataset.name
  );
  const objetoRelacionado = matchConnections.find((connection) => connection.objetoName === objetoName);

  // Si ya están relacionados, no permite hacer más conexiones
  if (programaRelacionado || objetoRelacionado) {
    return;
  }

  // Almacena la conexión en el array de matchConnections
  matchConnections.push({
    programaElement: currentPrograma,
    objectElement: e.currentTarget,
    programaName: currentPrograma.dataset.name,
    objetoName: objetoName,
  });

  // Dibuja una línea entre el programa y el objeto relacionado
  const programaRect = currentPrograma.getBoundingClientRect();
  const objetoRect = e.currentTarget.getBoundingClientRect();
  const gameRect = gameContainer.getBoundingClientRect();

  drawLine(
    programaRect.right - gameRect.left,
    programaRect.top + programaRect.height / 2 - gameRect.top,
    objetoRect.left - gameRect.left,
    objetoRect.top + objetoRect.height / 2 - gameRect.top
  );
}

// Maneja el inicio de un arrastre táctil en dispositivos móviles
function handleTouchStart(e) {
  e.preventDefault();
  if (e.touches.length === 1) {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    if (target && target.draggable) {
      currentPrograma = target; // Asigna el programa arrastrado en móvil
      currentPrograma.classList.add('dragging'); // Añade la clase 'dragging'
    }
  }
}

// Mueve el programa en la pantalla táctil mientras se arrastra
function handleTouchMove(e) {
  e.preventDefault();
  if (currentPrograma) {
    const touch = e.touches[0];
    currentPrograma.style.left = touch.clientX - currentPrograma.offsetWidth / 2 + 'px';
    currentPrograma.style.top = touch.clientY - currentPrograma.offsetHeight / 2 + 'px';
  }
}

// Maneja el fin del arrastre táctil en dispositivos móviles
function handleTouchEnd(e) {
  e.preventDefault();
  if (currentPrograma) {
    const touch = e.changedTouches[0];
    const dropTarget = document.elementFromPoint(touch.clientX, touch.clientY);

    // Si se suelta sobre una dropzone válida, realiza la conexión
    if (dropTarget && dropTarget.classList.contains('dropzone')) {
      handleDrop({ currentTarget: dropTarget, preventDefault: () => {} });
    }

    // Limpia el estilo del programa tras soltarlo
    currentPrograma.style.position = '';
    currentPrograma.style.left = '';
    currentPrograma.style.top = '';
    currentPrograma.classList.remove('dragging');
    currentPrograma = null;
  }
}

// Verifica si las conexiones realizadas son correctas
function checkResults() {
  let correct = true;

  // Verifica cada conexión y compara con los pares correctos
  matchConnections.forEach((connection) => {
    const isMatch = pairs.find(
      (pair) => pair.programa === connection.programaName && pair.objeto === connection.objetoName
    );
    if (!isMatch) {
      correct = false;
    }
  });

  // Muestra el resultado basado en si todas las relaciones son correctas
  if (correct && matchConnections.length === pairs.length) {
    result.textContent = '¡Correcto! Has hecho todas las relaciones correctamente.';
  } else {
    result.textContent = 'Algunas relaciones no son correctas. Intenta de nuevo.';
    retryButton.style.display = 'inline-block'; // Muestra el botón para reintentar
  }
}

// Asignación de eventos a los botones y eventos táctiles
retryButton.addEventListener('click', generateGame);
checkButton.addEventListener('click', checkResults);
checkButton.addEventListener('touchstart', checkResults, { passive: true });
retryButton.addEventListener('touchstart', generateGame, { passive: true });
document.addEventListener('touchmove', handleTouchMove, { passive: false });
document.addEventListener('touchend', handleTouchEnd, { passive: false });

// Inicia el juego al cargar la página
generateGame();
