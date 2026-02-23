import { Card } from '../ui/Card';
import { Trophy, Medal } from 'lucide-react';
import { storage } from '../../lib/storage';
import type { GameScore } from '../../types';

interface LeaderboardProps {
  gameType: '8queens' | 'sudoku';
  title: string;
}

export function Leaderboard({ gameType, title }: LeaderboardProps) {
  const scores = storage.getGameScores()
    .filter(s => s.gameType === gameType)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeTaken - b.timeTaken;
    })
    .slice(0, 10);

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (index === 1) return <Medal className="w-6 h-6 text-gray-400" />;
    if (index === 2) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="text-gray-500 font-semibold">{index + 1}</span>;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <span>{title}</span>
      </h3>
      <div className="space-y-3">
        {scores.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No scores yet. Be the first to play!</p>
        ) : (
          scores.map((score, index) => {
            const user = storage.getUserById(score.userId);
            return (
              <div
                key={score.id}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 flex items-center justify-center">
                    {getRankIcon(index)}
                  </div>
                  <div className="flex items-center space-x-3">
                    {user?.avatarUrl && (
                      <img
                        src={user.avatarUrl}
                        alt={user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">{user?.fullName || 'Unknown'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(score.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{score.score} pts</p>
                  <p className="text-sm text-gray-600">{formatTime(score.timeTaken)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
