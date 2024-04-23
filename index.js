//Variables globales
let bigBoard;
let currentPlayer = 'X';
let canvas;
let startTime;

//Funcion para cambiar el tamaño del tablero al cambiar el tamaño de la ventana
window.onresize = () => {
    canvas.width = window.innerHeight * 0.85;
    canvas.height = window.innerHeight * 0.85;
    drawBoard(canvas, canvas.getContext('2d'), size);
}

//Funcion para que la logica del juego se ejecute cuando la pagina este cargada, evitando errores
window.onload = () => {

    //Timer
    startTime = Date.now(); // Almacena el tiempo de inicio
    timerInterval = setInterval(updateTimer, 1000);

    // Obtener el canvas y el contexto, ademas de darle su tamaño inicial al canvas
    canvas = document.getElementById('board-canvas');
    canvas.width = window.innerHeight * 0.85;
    canvas.height = window.innerHeight * 0.85;
    const ctx = canvas.getContext('2d');
    size = 3;

    //Boton reset
    const reset = document.getElementById('reset-button');
    reset.onclick = () => {
        startTime = Date.now();
        updateTimer();
        bigBoard = createBigBoard(size);
        canvas = document.getElementById('board-canvas');

        drawBoard(canvas, ctx, size);
    }

    //Boton instrucciones
    const instructions = document.getElementById('instructions-button');
    const emergente = document.getElementById('modal_container');
    const close = document.getElementById('close');
    instructions.onclick = () => {
        emergente.classList.add('show');
    };
    close.addEventListener('click', () => {
        emergente.classList.remove('show');
    });


    // Crear la estructura de datos del tablero grande y los tableros pequeños
    bigBoard = createBigBoard(size);
    drawBoard(canvas, ctx, size);

    //Boton actualizar
    const guardar = document.getElementById('save-button');
    const inputSize = document.getElementById('board-size');
    guardar.onclick = () => {
        startTime = Date.now();
        updateTimer();
        if (inputSize.value !== size) {
            size = inputSize.value;
            bigBoard = createBigBoard(size);
            drawBoard(canvas, ctx, size, bigBoard);
        }
    }

    // Evento de click en el canvas
    canvas.addEventListener('click', function (event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const subBoardIndexX = Math.floor(x / (canvas.width / size));
        const subBoardIndexY = Math.floor(y / (canvas.height / size));
        const cellSize = canvas.width / size / 3;
        const cellIndexX = Math.floor((x % (canvas.width / size)) / cellSize);
        const cellIndexY = Math.floor((y % (canvas.height / size)) / cellSize);


        // Verificación de tablero pequeño completado
        if (isSubBoardComplete(subBoardIndexX, subBoardIndexY)) {
            return;
        }

        // Verificar si la casilla está vacía
        if (bigBoard.bigBoard[subBoardIndexY][subBoardIndexX][cellIndexY][cellIndexX] === '') {
            // Colocación de fichas
            let currentPlayerSymbol = currentPlayer === 'X' ? 'X' : 'O';
            bigBoard.bigBoard[subBoardIndexY][subBoardIndexX][cellIndexY][cellIndexX] = currentPlayerSymbol;
            drawSymbol(ctx, subBoardIndexX, subBoardIndexY, cellIndexX, cellIndexY, currentPlayerSymbol, cellSize);

            // Cambio de jugador
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

            // Verificación de victoria en el tablero pequeño
            if (isWinner(bigBoard.bigBoard[subBoardIndexY][subBoardIndexX], currentPlayerSymbol)) {
                // Marcar el tablero pequeño como completo
                bigBoard.subBoardWinners[subBoardIndexY][subBoardIndexX] = currentPlayerSymbol;
                drawSymbolWinner(currentPlayerSymbol, ctx, subBoardIndexX, subBoardIndexY);

                // Verificar victoria en el tablero grande
                if (isWinner(bigBoard.subBoardWinners, currentPlayerSymbol)) {
                    setTimeout(function () {
                        alert(`¡El jugador con ${currentPlayerSymbol} ha ganado!`);
                        bigBoard = createBigBoard(size);
                        drawBoard(canvas, ctx, size);
                    }, 10);
                }

            // Verificación de empate en el tablero pequeño
            } else if (isFull(bigBoard.bigBoard[subBoardIndexY][subBoardIndexX])) {
                clearSubBoard(subBoardIndexX, subBoardIndexY, ctx, canvas, size);
                bigBoard.bigBoard[subBoardIndexY][subBoardIndexX].forEach((row, i) => {
                    row.forEach((cell, j) => {
                        bigBoard.bigBoard[subBoardIndexY][subBoardIndexX][i][j] = '';
                    });
                });
            }
        }
    });
}

//Creacion de los array que representan el tablero grande y los tableros pequeños
function createBigBoard(size) {
    const bigBoard = [];
    const subBoardWinners = [];
    for (let i = 0; i < size; i++) {
        const row = [];
        const winnersRow = [];
        for (let j = 0; j < size; j++) {
            const subBoard = [];
            for (let k = 0; k < 3; k++) {
                const subRow = [];
                for (let l = 0; l < 3; l++) {
                    subRow.push('');
                }
                subBoard.push(subRow);
            }
            row.push(subBoard);
            winnersRow.push('');
        }
        bigBoard.push(row);
        subBoardWinners.push(winnersRow);
    }
    return { bigBoard, subBoardWinners };
}

//Dibujar en el canvas
function drawBoard(canvas, ctx, size) {
    // Obtener las dimensiones del canvas
    const width = canvas.width;
    const height = canvas.height;

    // Calcular las proporciones para el tablero
    const cellSize = width / size;

    // Limpiar el canvas
    ctx.clearRect(0, 0, width, height);

    // Dibujar las líneas del tablero
    ctx.beginPath();
    for (let i = 1; i < size; i++) {
        // Dibujar líneas horizontales
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(width, i * cellSize);

        // Dibujar líneas verticales
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, height);
    }

    // Estilo de las lineas
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Dibujar los tableros pequeños
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            drawMiniBoard(ctx, i * cellSize, j * cellSize, cellSize);
        }
    }
}


// Funcion para dibujar un tablero pequeño
function drawMiniBoard(ctx, x, y, size) {
    // Calcular el tamaño de cada casilla del juego de tres en raya dentro del recuadro
    const cellSize = size / 3;


    // Dibujar las líneas de las casillas del juego de tres en raya
    ctx.beginPath();
    for (let i = 1; i < 3; i++) {
        // Dibujar líneas horizontales
        ctx.moveTo(x, y + i * cellSize);
        ctx.lineTo(x + size, y + i * cellSize);

        // Dibujar líneas verticales
        ctx.moveTo(x + i * cellSize, y);
        ctx.lineTo(x + i * cellSize, y + size);
    }

    // Dibujar las líneas secundarias del tablero más delgadas
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.stroke();
}

//Funcion para verificar si un tablero pequeño esta completo
function isSubBoardComplete(subBoardIndexX, subBoardIndexY) {
    return bigBoard.subBoardWinners[subBoardIndexY][subBoardIndexX] !== '';
}

//Funcion para dibujar el simbolo en la posicion correcta del tablero
function drawSymbol(ctx, subBoardIndexX, subBoardIndexY, cellIndexX, cellIndexY, currentPlayerSymbol, cellSize) {
    // Calcular las coordenadas de la celda dentro del tablero grande
    const x = subBoardIndexX * cellSize * 3 + cellIndexX * cellSize + cellSize / 2;
    const y = subBoardIndexY * cellSize * 3 + cellIndexY * cellSize + cellSize / 2;

    // Dibujar el símbolo del jugador en el centro de la celda
    ctx.font = `${cellSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(currentPlayerSymbol, x, (y + cellSize / 10));
}

//Funcion para dibujar el simbolo del ganador al completar un tablero pequeño
function drawSymbolWinner(winner, ctx, subBoardIndexX, subBoardIndexY) {
// Calcular las coordenadas del centro del tablero pequeño
    const x = subBoardIndexX * (canvas.width / size) + (canvas.width / size) / 2;
    const y = subBoardIndexY * (canvas.height / size) + (canvas.height / size) / 2;

    // Dibujar el símbolo del jugador en el centro del tablero pequeño
    ctx.font = `${canvas.width / size}px Arial`;
    ctx.fillStyle = winner === 'X' ? 'red' : 'blue';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(winner, x, (y + canvas.height / size / 15));
    ctx.fillStyle = 'black';
}

//Funcion para verificar si un jugador ha ganado en un tablero
function isWinner(board, symbol) {
    const size = board.length;

    // Verificar filas
    for (let i = 0; i < size; i++) {
        let rowCount = 0;
        for (let j = 0; j < size; j++) {
            if (board[i][j] === symbol) {
                rowCount++;
            }
            if (rowCount === 3) {
                return true;
            }
        }
    }

    // Verificar columnas
    for (let i = 0; i < size; i++) {
        let colCount = 0;
        for (let j = 0; j < size; j++) {
            if (board[j][i] === symbol) {
                colCount++;
            }
            if (colCount === 3) {
                return true;
            }
        }
    }

    // Verificar diagonales
    let diag1Count = 0;
    let diag2Count = 0;
    for (let i = 0; i < size; i++) {
        if (board[i][i] === symbol) {
            diag1Count++;
        }
        if (board[i][size - 1 - i] === symbol) {
            diag2Count++;
        }
    }
    if (diag1Count === 3 || diag2Count === 3) {
        return true;
    }

    return false;
}

//Funcion para limpiar un tablero pequeño
function clearSubBoard(subBoardIndexX, subBoardIndexY, ctx, canvas, size) {
    const cellSize = canvas.width / size;
    const startX = subBoardIndexX * cellSize;
    const startY = subBoardIndexY * cellSize;

    // Limpiar el contenido de cada casilla del tablero pequeño
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            const x = startX + j * (cellSize / 3);
            const y = startY + i * (cellSize / 3);
            ctx.clearRect(x + 3, y+3, cellSize / 3 - 6, cellSize / 3 - 6);
        }
    }

    // Volver a dibujar las líneas del tablero
    drawMiniBoard(ctx, startX, startY, cellSize);
}

//Funcion para verificar si un tablero pequeño esta lleno
function isFull(board) {
    for (let row of board) {
        for (let cell of row) {
            if (cell === '') {
                return false;
            }
        }
    }
    return true;
}

//Funcion para actualizar el timer
function updateTimer() {
    const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Calcula el tiempo transcurrido en segundos
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    document.getElementById('timer').textContent = `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
}