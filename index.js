let bigBoard;
let currentPlayer = 'X';
let canvas;

window.onload = () => {
    canvas = document.getElementById('board-canvas');
    const ctx = canvas.getContext('2d');
    size = 3;

    // Crear la estructura de datos del tablero grande y los tableros pequeños
    bigBoard = createBigBoard(size);

    drawBoard(canvas, ctx, size);

    const guardar = document.getElementById('save-button');
    const inputSize = document.getElementById('board-size');
    guardar.onclick = () => {
        size = inputSize.value;
        bigBoard = createBigBoard(size);
        drawBoard(canvas, ctx, size, bigBoard);
    }

    canvas.addEventListener('click', function(event) {
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
            return; // El tablero pequeño está completo, no se puede seleccionar
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
            }
        }
    });
}

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
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 4;
    ctx.stroke();

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            drawMiniBoard(ctx, i * cellSize, j * cellSize, cellSize);
        }
    }
}

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

function isSubBoardComplete(subBoardIndexX, subBoardIndexY) {
    return bigBoard.subBoardWinners[subBoardIndexY][subBoardIndexX] !== '';
}

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


function isWinner(board, symbol) {
    // Verificar filas
    for (let i = 0; i < 3; i++) {
        if (board[i][0] === symbol && board[i][1] === symbol && board[i][2] === symbol) {
            return true;
        }
    }

    // Verificar columnas
    for (let i = 0; i < 3; i++) {
        if (board[0][i] === symbol && board[1][i] === symbol && board[2][i] === symbol) {
            return true;
        }
    }

    // Verificar diagonales
    if (board[0][0] === symbol && board[1][1] === symbol && board[2][2] === symbol) {
        return true;
    }
    if (board[0][2] === symbol && board[1][1] === symbol && board[2][0] === symbol) {
        return true;
    }

    return false;
}
