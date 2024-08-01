let turboPosition = { row: 0, col: 0 };
var img = document.createElement("IMG");
img.src = "turbo.png";
let attempts = 1;
let gameRunning = false;
const gridContainer = document.getElementById('grid-container');

document.getElementById('nForm').addEventListener('submit', function(event) {
    event.preventDefault();
    n = parseInt(document.getElementById('NVal').value);

    if (isNaN(n) || n <= 3) {
        alert("Please enter a valid number greater than 3.");
        return;
    }

    if (n > 50) {
        alert("Please enter a smaller number.");
        return;
    }
    gameRunning = false;
    initializeGrid();
});

function initializeGrid() {
    // Clear the grid and create n-1 columns, each the size of a fraction.
    gridContainer.innerHTML = '';
    gridContainer.style.gridTemplateColumns = `repeat(${n-1}, 1fr)`;

    const numRows = n - 2;
    const numCols = n - 1;

    // Creating an array from 0 to numCols - 1 and then shuffling it.
    const columns = Array.from({ length: numCols }, (_, index) => index);
    for (let i = columns.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [columns[i], columns[j]] = [columns[j], columns[i]];
    }

    const monsterPositions = [];
    for (let row = 1; row <= numRows; row++) {
        monsterPositions.push({ row, col: columns[row - 1] });
    }

    for (let row = 0; row < n; row++) {
        for (let col = 0; col < n - 1; col++) {
            const gridItem = document.createElement('div');
            if (row == 0 && col == 0) {
                gridItem.className = 'grid-item snail-grid';
                gridItem.appendChild(img);
            } else {
                const monster = monsterPositions.find(pos => pos.row === row && pos.col === col);
                if (monster) {
                    gridItem.className = 'grid-item enemy-grid';
                    gridItem.textContent = 'M';
                } else {
                    gridItem.className = 'grid-item default-grid';
                    gridItem.textContent = (row * (n - 1)) + col + 1;
                }
            }
            gridContainer.appendChild(gridItem);
        }
    }

    turboPosition = { row: 0, col: 0 };
    updateTurboPosition();
}

function moveTurbo(direction) {
    const gridItems = document.querySelectorAll('.grid-item');
    let newRow = turboPosition.row;
    let newCol = turboPosition.col;

    switch (direction) {
        case 'up':
            newRow--;
            break;
        case 'down':
            newRow++;
            break;
        case 'left':
            newCol--;
            break;
        case 'right':
            newCol++;
            break;
        case 'reset':
            newRow = 0;
            newCol = 0;
            break;
        default:
            console.error('Invalid direction');
            return;
    }

    if (!(turboPosition.row >= 0 && turboPosition.row <= n - 1 && turboPosition.col >= 0 && turboPosition.col <= n - 2)) {
        console.error("Out of bound serror.");
        return;
    }

    const newIndex = newRow * (n - 1) + newCol;
    const newCell = gridItems[newIndex];

    if (newCell && !newCell.classList.contains('enemy-grid')) {
        const previousIndex = turboPosition.row * (n - 1) + turboPosition.col;
        const previousCell = gridItems[previousIndex];

        previousCell.innerHTML = '';
        previousCell.className = 'grid-item default-grid';
        previousCell.textContent = (turboPosition.row * (n - 1)) + turboPosition.col + 1;
    

        turboPosition = { row: newRow, col: newCol };
        updateTurboPosition();

        return;
    }
    if (newCell) {
        newCell.classList='grid-item enemy-found-grid';
    }
    attempts += 1;
}

function updateTurboPosition() {
    const gridItems = document.querySelectorAll('.grid-item');
    const previousIndex = turboPosition.row * (n - 1) + turboPosition.col;
    const turboCell = gridItems[previousIndex];
    if (turboCell) {
        turboCell.innerHTML = '';
        turboCell.className = 'grid-item snail-grid';
        turboCell.appendChild(img);
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function moveWithDelay(direction) {
    moveTurbo(direction);
    await delay(200);
}

document.getElementById('simForm').addEventListener('submit', async function(event) {
    event.preventDefault();

    if (gameRunning) return;
    gameRunning = true;


    attempts = 1;
    let monster1Pos = {row:-1,col:-1};
    let monster2Pos = {row:-1,col:-1};
    let attemptPos = {row:1,col:0};



    // Step 1: Determine the monster location in the second row

    await moveWithDelay("down");
    while (attempts != 2 && gameRunning) {
        attemptPos["col"] += 1;
        await moveWithDelay("right");
    }
    monster1Pos = attemptPos;
    await moveWithDelay("reset");
    attemptPos = {row:0,col:0};

    

    // Easy Case: Either go down and back on the left or on the right.
    //console.log(monster1Pos["col"]);
    if (monster1Pos["col"] >= 1 && monster1Pos["col"] < n - 2) {
        while (attemptPos["col"] != monster1Pos["col"] - 1 && gameRunning) { // Trying Left of monster
            await moveWithDelay("right");
            attemptPos["col"] += 1;
        }
        await moveWithDelay("down");
        await moveWithDelay("down");
        attemptPos["row"] += 2;
        if (attempts == 3) {
            monster2Pos = attemptPos;
            await moveWithDelay("reset");
            attemptPos = {row:0,col:0};
        } else {
            await moveWithDelay("right");
            attemptPos["col"] += 1;
            while (attemptPos["row"] != n - 1 && gameRunning) {
                await moveWithDelay("down");
            }
            gameRunning = false;
            return;
        }
        
        while (attemptPos["col"] != monster1Pos["col"] + 1 && gameRunning) { // Trying Right of monster
            await moveWithDelay("right");
            attemptPos["col"] += 1;
        }
        await moveWithDelay("down");
        await moveWithDelay("down");
        attemptPos["row"] += 2;
        await moveWithDelay("left");
        attemptPos["col"] += 1;
        while (attemptPos["row"] != n - 1 && gameRunning) {
            await moveWithDelay("down");
        }
        gameRunning = false;
        return;

    } else { // Monster is on the corners
        let diagmov;
        let num;
        if (monster1Pos["col"] == 0) {
            diagmov = "right";
            num = 1;
        } else {
            diagmov = "left";
            num = -1;
        }
        while (attemptPos["col"] != monster1Pos["col"] + num && gameRunning) {
            await moveWithDelay("right");
            attemptPos["col"]+=1;
        }
        await moveWithDelay("down");
        attemptPos["row"] += 1;
        let alt = 0;


        while (attempts != 3 && gameRunning && attemptPos["row"] != n - 1) {
            if (alt == 1) {
                await moveWithDelay("down");
                attemptPos["row"]+=1;

            } else {
                if (attemptPos["col"] == 0 || attemptPos["col"] == n-2) {
                    await moveWithDelay("down");
                    attemptPos["row"] += 1;

                } else {
                    await moveWithDelay(diagmov);
                    attemptPos["col"] += num;

                }
            }

            alt = !alt;
        }
        if (attemptPos["row"] == n - 1 || !gameRunning) {
            return;
        }
        monster2Pos = attemptPos;
        await moveWithDelay("reset");
        attemptPos = {row:0,col:0};
 

        alt = 0;
        while (attemptPos["col"] != monster1Pos["col"] + num && gameRunning) {
            await moveWithDelay("right");
            attemptPos["col"]+=1;
        }
        await moveWithDelay("down");
        attemptPos["row"] += 1;
        // console.log(monster1Pos["col"]);
        // console.log(monster1Pos["row"]);
        // console.log(monster2Pos["col"]);
        // console.log(monster2Pos["row"]);
        while (attemptPos["col"] + num != monster2Pos["col"] && gameRunning) {
            if (alt == 1) {
                await moveWithDelay("down");
                attemptPos["row"]+=1;
                console.log("?")
            } else {
                await moveWithDelay(diagmov);
                console.log("!")
                attemptPos["col"] += num;
            }
            alt = !alt;
        }
        console.log("reached1");
        while (attemptPos["row"] != monster2Pos["row"] && gameRunning) {
            await moveWithDelay("down");
            attemptPos["row"]+=1;
        }
        // console.log("reached2");
        // console.log(attemptPos["col"]);
        // console.log(attemptPos["row"]);
        while (attemptPos["col"] != monster1Pos["col"] && gameRunning) {
            if (diagmov == "right") {
                await moveWithDelay("left");
            } else {
                await moveWithDelay("right");
            }
            attemptPos["col"] += -num;
            // await moveWithDelay(diagmov);
            // attemptPos["col"]+=num;
        }
        console.log("reached3");
        while (attemptPos["row"] != n - 1 && gameRunning && gameRunning) {
            await moveWithDelay("down");
        }
        console.log("reached4");
        gameRunning = false;
        return;

    }
});
