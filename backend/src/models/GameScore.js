import mongoose from 'mongoose';

const gameScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameType: {
      type: String,
      enum: ['8queens', 'sudoku'],
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    timeTaken: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

gameScoreSchema.index({ gameType: 1, score: -1, timeTaken: 1 });

const GameScore = mongoose.model('GameScore', gameScoreSchema);

export default GameScore;
