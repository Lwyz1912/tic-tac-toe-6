const { createApp, ref, computed, onMounted, onBeforeUnmount } = Vue;

createApp({
  setup() {
    const board = ref(Array(9).fill(''));
    const currentPlayer = ref('X');
    const gameOver = ref(false);
    const winner = ref(null);
    const isDarkTheme = ref(true);
    const moveHistory = ref([]);
    const gameMode = ref('pvp'); 
    const playerSymbol = ref('X');
    const cpuSymbol = ref('O');
    const cpuMoveTimeout = ref(null);

    const status = computed(() => {
      if (winner.value) {
        return `Player ${winner.value} wins!`;
      } else if (gameOver.value) {
        return 'Game ended in a draw!';
      } else {
        if (gameMode.value === 'cpu') {
          if (currentPlayer.value === playerSymbol.value) {
            return `Your turn (${playerSymbol.value})`;
          } else {
            return `CPU's turn (${cpuSymbol.value})`;
          }
        } else {
          return `Player ${currentPlayer.value}'s turn`;
        }
      }
    });

    let cpuCheckInterval = null;

    onMounted(() => {
      cpuCheckInterval = setInterval(() => {
        if (gameMode.value === 'cpu' && 
            currentPlayer.value === cpuSymbol.value && 
            !gameOver.value &&
            !cpuMoveTimeout.value) {
          cpuMoveTimeout.value = setTimeout(() => {
            makeCPUMove();
            cpuMoveTimeout.value = null;
          }, 700);
        }
      }, 300);
    });

    onBeforeUnmount(() => {
      clearInterval(cpuCheckInterval);
      if (cpuMoveTimeout.value) {
        clearTimeout(cpuMoveTimeout.value);
      }
    });

    function makeCPUMove() {
      const availableMoves = [];
      
      for (let i = 0; i < 9; i++) {
        if (board.value[i] === '') {
          availableMoves.push(i);
        }
      }
      
      if (availableMoves.length > 0 && !gameOver.value) {
        const randomIndex = Math.floor(Math.random() * availableMoves.length);
        const moveIndex = availableMoves[randomIndex];
        
        board.value[moveIndex] = cpuSymbol.value;
        
        moveHistory.value.push({
          index: moveIndex,
          player: cpuSymbol.value
        });

        if (moveHistory.value.length > 6) {
          const oldestMove = moveHistory.value.shift();
          board.value[oldestMove.index] = '';
        }

        checkWinCondition();
        
        if (!gameOver.value) {
          currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X';
        }
      }
    }

    function setGameMode(mode) {
      gameMode.value = mode;
      resetGame();
      
      if (mode === 'cpu' && currentPlayer.value === cpuSymbol.value) {
        if (cpuMoveTimeout.value) {
          clearTimeout(cpuMoveTimeout.value);
        }
        
        cpuMoveTimeout.value = setTimeout(() => {
          makeCPUMove();
          cpuMoveTimeout.value = null;
        }, 700);
      }
    }

    function randomizeStartingPlayer() {
      currentPlayer.value = Math.random() < 0.5 ? 'X' : 'O';
      
      if (gameMode.value === 'cpu') {
        if (Math.random() < 0.5) {
          playerSymbol.value = 'X';
          cpuSymbol.value = 'O';
        } else {
          playerSymbol.value = 'O';
          cpuSymbol.value = 'X';
        }
        
        if (currentPlayer.value === cpuSymbol.value) {
          if (cpuMoveTimeout.value) {
            clearTimeout(cpuMoveTimeout.value);
          }
          
          cpuMoveTimeout.value = setTimeout(() => {
            makeCPUMove();
            cpuMoveTimeout.value = null;
          }, 700);
        }
      }
    }

    function makeMove(index) {
      if (board.value[index] !== '' || gameOver.value) {
        return;
      }

      if (gameMode.value === 'cpu' && currentPlayer.value !== playerSymbol.value) {
        return;
      }

      board.value[index] = currentPlayer.value;
      
      moveHistory.value.push({
        index,
        player: currentPlayer.value
      });

      if (moveHistory.value.length > 6) {
        const oldestMove = moveHistory.value.shift();
        board.value[oldestMove.index] = '';
      }

      checkWinCondition();
      
      if (!gameOver.value) {
        currentPlayer.value = currentPlayer.value === 'X' ? 'O' : 'X';
      }
    }

    function checkWinCondition() {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
      ];

      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board.value[a] && 
            board.value[a] === board.value[b] && 
            board.value[a] === board.value[c]) {
          winner.value = board.value[a];
          gameOver.value = true;
          return;
        }
      }

      const filledCells = board.value.filter(cell => cell !== '').length;
      if (filledCells === 9 || moveHistory.value.length === 9) {
        gameOver.value = true;
      }
    }

    function shouldFade(index) {
      if (moveHistory.value.length === 6 && 
          moveHistory.value[0].index === index) {
        return true;
      }
      return false;
    }

    function resetGame() {
      if (cpuMoveTimeout.value) {
        clearTimeout(cpuMoveTimeout.value);
        cpuMoveTimeout.value = null;
      }
      
      board.value = Array(9).fill('');
      currentPlayer.value = 'X';
      gameOver.value = false;
      winner.value = null;
      moveHistory.value = [];
      
      playerSymbol.value = 'X';
      cpuSymbol.value = 'O';
      
      if (gameMode.value === 'cpu' && currentPlayer.value === cpuSymbol.value) {
        cpuMoveTimeout.value = setTimeout(() => {
          makeCPUMove();
          cpuMoveTimeout.value = null;
        }, 700);
      }
    }

    function toggleTheme() {
      isDarkTheme.value = !isDarkTheme.value;
      document.body.classList.toggle('light-theme', !isDarkTheme.value);
    }

    if (isDarkTheme.value) {
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
    }

    return {
      board,
      currentPlayer,
      gameOver,
      winner,
      status,
      isDarkTheme,
      moveHistory,
      gameMode,
      makeMove,
      resetGame,
      toggleTheme,
      shouldFade,
      setGameMode,
      randomizeStartingPlayer
    };
  }
}).mount('#app');