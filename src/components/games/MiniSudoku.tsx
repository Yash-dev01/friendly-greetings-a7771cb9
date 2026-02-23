import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, RotateCcw, CheckCircle, Trophy, Clock } from 'lucide-react';
import { storage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

interface MiniSudokuProps {
  onBack: () => void;
}

const generatePuzzle = (): number[][] => {
  const solution = [
    [1, 2, 3, 4],
    [3, 4, 1, 2],
    [2, 3, 4, 1],
    [4, 1, 2, 3]
  ];

  const variations = [
    [1, 2, 3, 4],
    [2, 1, 4, 3],
    [3, 4, 1, 2],
    [4, 3, 2, 1]
  ];

  const randomVariation = variations[Math.floor(Math.random() * variations.length)];
  const puzzle = solution.map(row =>
    row.map(cell => randomVariation[cell - 1])
  );

  const cellsToRemove = 6;
  const removed = new Set<string>();
  while (removed.size < cellsToRemove) {
    const row = Math.floor(Math.random() * 4);
    const col = Math.floor(Math.random() * 4);
    removed.add(`${row}-${col}`);
  }

  return puzzle.map((row, i) =>
    row.map((cell, j) => (removed.has(`${i}-${j}`) ? 0 : cell))
  );
};

export function MiniSudoku({ onBack }: MiniSudokuProps) {
  const [puzzle, setPuzzle] = useState<number[][]>(generatePuzzle());
  const [userBoard, setUserBoard] = useState<number[][]>(puzzle.map(row => [...row]));
  const [startTime] = useState(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (isComplete) return;

    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, isComplete]);

  const isValidMove = (board: number[][], row: number, col: number, num: number): boolean => {
    for (let i = 0; i < 4; i++) {
      if (i !== col && board[row][i] === num) return false;
      if (i !== row && board[i][col] === num) return false;
    }
    return true;
  };

  const checkComplete = (board: number[][]): boolean => {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        if (board[i][j] === 0 || !isValidMove(board, i, j, board[i][j])) {
          return false;
        }
      }
    }
    return true;
  };

  useEffect(() => {
    if (checkComplete(userBoard) && !isComplete) {
      setIsComplete(true);
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      if (user) {
        const score = Math.max(100 - timeTaken, 10);
        storage.addGameScore({
          id: Date.now().toString(),
          userId: user.id,
          gameType: 'sudoku',
          score,
          timeTaken,
          createdAt: new Date().toISOString()
        });
      }
    }
  }, [userBoard, isComplete, startTime, user]);

  const handleCellClick = (row: number, col: number, num: number) => {
    if (puzzle[row][col] !== 0 || isComplete) return;

    const newBoard = userBoard.map(r => [...r]);
    newBoard[row][col] = num;
    setUserBoard(newBoard);
  };

  const resetBoard = () => {
    const newPuzzle = generatePuzzle();
    setPuzzle(newPuzzle);
    setUserBoard(newPuzzle.map(row => [...row]));
    setIsComplete(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </Button>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg shadow">
            <Clock className="w-5 h-5 text-blue-600" />
            <span className="text-xl font-mono font-bold text-gray-900">
              {formatTime(elapsedTime)}
            </span>
          </div>
          <Button variant="secondary" onClick={resetBoard} className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>New Puzzle</span>
          </Button>
        </div>
      </div>

      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
            <Trophy className="w-6 h-6 text-blue-500" />
            <span>Mini Sudoku (4x4)</span>
          </h2>
          <p className="text-gray-600">
            Fill the grid so each row and column contains numbers 1-4
          </p>
        </div>

        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-center space-x-2"
          >
            <CheckCircle className="w-6 h-6 text-green-600" />
            <p className="text-green-700 font-semibold">
              Completed in {formatTime(elapsedTime)}! Score: {Math.max(100 - elapsedTime, 10)}
            </p>
          </motion.div>
        )}

        <div className="flex justify-center mb-6">
          <div className="inline-block border-4 border-gray-800 rounded-lg overflow-hidden shadow-lg">
            {userBoard.map((row, i) => (
              <div key={i} className="flex">
                {row.map((cell, j) => {
                  const isFixed = puzzle[i][j] !== 0;
                  const hasError = cell !== 0 && !isValidMove(userBoard, i, j, cell);

                  return (
                    <div
                      key={`${i}-${j}`}
                      className={`w-20 h-20 border border-gray-300 flex items-center justify-center ${
                        isFixed ? 'bg-gray-200' : 'bg-white'
                      } ${hasError ? 'bg-red-100' : ''}`}
                    >
                      {cell !== 0 ? (
                        <span
                          className={`text-3xl font-bold ${
                            isFixed ? 'text-gray-900' : 'text-blue-600'
                          } ${hasError ? 'text-red-600' : ''}`}
                        >
                          {cell}
                        </span>
                      ) : (
                        <div className="grid grid-cols-2 gap-1 p-1">
                          {[1, 2, 3, 4].map(num => (
                            <button
                              key={num}
                              onClick={() => handleCellClick(i, j, num)}
                              disabled={isComplete}
                              className="w-7 h-7 text-sm text-gray-500 hover:bg-blue-100 hover:text-blue-600 rounded transition-colors"
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">How to Play:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Click on empty cells to select a number (1-4)</li>
            <li>• Each row must contain numbers 1, 2, 3, and 4</li>
            <li>• Each column must contain numbers 1, 2, 3, and 4</li>
            <li>• Red cells indicate conflicts</li>
            <li>• Faster completion = Higher score!</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
