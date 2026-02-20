import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trophy, Crown } from 'lucide-react';
import { EightQueens } from '../components/games/EightQueens';
import { MiniSudoku } from '../components/games/MiniSudoku';
import { Leaderboard } from '../components/games/Leaderboard';
import { motion } from 'framer-motion';

type GameType = 'menu' | '8queens' | 'sudoku';

export function Games() {
  const [currentGame, setCurrentGame] = useState<GameType>('menu');

  if (currentGame === '8queens') {
    return <EightQueens onBack={() => setCurrentGame('menu')} />;
  }

  if (currentGame === 'sudoku') {
    return <MiniSudoku onBack={() => setCurrentGame('menu')} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
          <Crown className="w-8 h-8 text-yellow-500" />
          <span>Games Arena</span>
        </h1>
        <p className="text-gray-600">Challenge yourself and compete with the community!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card hover>
            <div className="text-center">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">8 Queens Puzzle</h3>
              <p className="text-gray-600 mb-4">
                Place 8 queens on a chessboard so that no queen can attack another queen
              </p>
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p>• 8x8 chessboard</p>
                <p>• No queens on same row, column, or diagonal</p>
                <p>• Multiple solutions possible</p>
              </div>
              <Button
                onClick={() => setCurrentGame('8queens')}
                className="w-full"
              >
                Play Now
              </Button>
            </div>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card hover>
            <div className="text-center">
              <div className="bg-gradient-to-br from-blue-500 to-cyan-500 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Mini Sudoku</h3>
              <p className="text-gray-600 mb-4">
                Fill a 4x4 grid with numbers 1-4, each appearing once per row and column
              </p>
              <div className="space-y-2 text-sm text-gray-600 mb-6">
                <p>• 4x4 simplified sudoku</p>
                <p>• Race against the clock</p>
                <p>• Perfect for quick challenges</p>
              </div>
              <Button
                onClick={() => setCurrentGame('sudoku')}
                className="w-full"
              >
                Play Now
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Leaderboard gameType="8queens" title="8 Queens Champions" />
        <Leaderboard gameType="sudoku" title="Sudoku Speed Masters" />
      </div>
    </div>
  );
}
