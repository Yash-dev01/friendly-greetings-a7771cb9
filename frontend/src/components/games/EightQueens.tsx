import { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { ArrowLeft, RotateCcw, CheckCircle, Crown } from 'lucide-react';
import { storage } from '../../lib/storage';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

interface EightQueensProps {
  onBack: () => void;
}

export function EightQueens({ onBack }: EightQueensProps) {
  const [board, setBoard] = useState<boolean[][]>(
    Array(8).fill(null).map(() => Array(8).fill(false))
  );
  const [startTime] = useState(Date.now());
  const [isComplete, setIsComplete] = useState(false);
  const { user } = useAuth();

  const isValid = (row: number, col: number): boolean => {
    for (let i = 0; i < 8; i++) {
      if (board[row][i] && i !== col) return false;
      if (board[i][col] && i !== row) return false;
    }

    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j] && i !== row && j !== col) {
          if (Math.abs(i - row) === Math.abs(j - col)) return false;
        }
      }
    }

    return true;
  };

  const checkSolution = (): boolean => {
    let queensCount = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (board[i][j]) {
          queensCount++;
          if (!isValid(i, j)) return false;
        }
      }
    }
    return queensCount === 8;
  };

  useEffect(() => {
    if (checkSolution() && !isComplete) {
      setIsComplete(true);
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      if (user) {
        storage.addGameScore({
          id: Date.now().toString(),
          userId: user.id,
          gameType: '8queens',
          score: 100,
          timeTaken,
          createdAt: new Date().toISOString()
        });
      }
    }
  }, [board, isComplete, startTime, user]);

  const toggleQueen = (row: number, col: number) => {
    if (isComplete) return;
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = !newBoard[row][col];
    setBoard(newBoard);
  };

  const resetBoard = () => {
    setBoard(Array(8).fill(null).map(() => Array(8).fill(false)));
    setIsComplete(false);
  };

  const queensPlaced = board.flat().filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center space-x-2">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Games</span>
        </Button>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Queens Placed</p>
            <p className="text-2xl font-bold text-gray-900">{queensPlaced} / 8</p>
          </div>
          <Button variant="secondary" onClick={resetBoard} className="flex items-center space-x-2">
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
        </div>
      </div>

      <Card>
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center justify-center space-x-2">
            <Crown className="w-6 h-6 text-purple-500" />
            <span>8 Queens Puzzle</span>
          </h2>
          <p className="text-gray-600">
            Place 8 queens on the board so that no queen can attack another
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
              Congratulations! You solved the puzzle in {Math.floor((Date.now() - startTime) / 1000)} seconds!
            </p>
          </motion.div>
        )}

        <div className="flex justify-center">
          <div className="inline-block border-4 border-gray-800 rounded-lg overflow-hidden shadow-lg">
            {board.map((row, i) => (
              <div key={i} className="flex">
                {row.map((hasQueen, j) => {
                  const isLight = (i + j) % 2 === 0;
                  const canPlace = !hasQueen && isValid(i, j);
                  return (
                    <button
                      key={`${i}-${j}`}
                      onClick={() => toggleQueen(i, j)}
                      disabled={isComplete}
                      className={`w-16 h-16 flex items-center justify-center text-3xl transition-all ${
                        isLight ? 'bg-amber-100' : 'bg-amber-700'
                      } ${
                        hasQueen
                          ? isValid(i, j)
                            ? 'bg-green-200'
                            : 'bg-red-200'
                          : canPlace
                          ? 'hover:bg-blue-200'
                          : ''
                      } ${isComplete ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      {hasQueen && '♛'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Rules:</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Place exactly 8 queens on the board</li>
            <li>• No two queens can be on the same row</li>
            <li>• No two queens can be on the same column</li>
            <li>• No two queens can be on the same diagonal</li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
