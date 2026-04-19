type DetailItem = {
  option_id: number;
  bet_amount: number;
};

export type TransformedRound = {
  round_id: number;
  winning_option_id: number[];
  status: number;
  detail: DetailItem[];
};

type RoundData={
  id:number,
  game_id:number,
  round_no:number,
  winning_option_id:number[] ;
  status:number,
  created_at:string,
}
export type Bets={
  id?:number;
  round_id?:number;
  player_id?:number;
  game_id?:number;
  option_id?:number;
  amount?:string;
  status?:number;
  created_at?:string;
  round_data?:RoundData;
}
type PlayerLogData={
  round_id:number;
  round_no:number;
  winning_option:number[];
  is_jackpot:number;
  winAnyOption:boolean;
  bets:Bets[];
}


const ROUND_OPTION_IDS = [5, 6, 7, 8, 9, 10, 11, 12] as const;

type MutableRound = {
  round_id: number;
  winning_option_id: number[];
  status: number;
  detail: number[];
};

function parseWinningIds(input: unknown): number[] {
  if (input === null || input === undefined) return [];

  // already array
  if (Array.isArray(input)) {
    return input.map(Number).filter(n => !Number.isNaN(n));
  }

  if (typeof input === "string") {
    const trimmed = input.trim();

    // case 1: JSON array string -> ["5","6"]
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(Number).filter(n => !Number.isNaN(n));
        }
      } catch {
        // fallback below
      }
    }

    // case 2: single number string -> "9"
    const num = Number(trimmed);
    return Number.isNaN(num) ? [] : [num];
  }

  // case 3: number
  if (typeof input === "number") {
    return [input];
  }

  return [];
}

export const transformGameLog = (
  data: PlayerLogData[]
): TransformedRound[] => {
  const rounds = new Map<number, MutableRound>();

  for (const item of data) {
    if (item.round_id === undefined) {
      continue;
    }

    const roundId = item.round_id;
    let round = rounds.get(roundId);

    if (!round) {
      round = {
        round_id: roundId,
        winning_option_id: parseWinningIds(item.winning_option),
        status: item.winAnyOption ? 1 : 0,
        detail: new Array(ROUND_OPTION_IDS.length).fill(0),
      };
      rounds.set(roundId, round);
    }

    for (const bet of item.bets) {
      if (bet.option_id === undefined || bet.amount === undefined) {
        continue;
      }

      const amount = Number(bet.amount);
      const optionIndex = bet.option_id - ROUND_OPTION_IDS[0];

      if (Number.isFinite(amount) && optionIndex >= 0 && optionIndex < round.detail.length) {
        round.detail[optionIndex] += amount;
      }
    }
  }

  return Array.from(rounds.values())
    .map((round) => ({
      round_id: round.round_id,
      winning_option_id: round.winning_option_id,
      status: round.status,
      detail: round.detail.map((bet_amount, index) => ({
        option_id: ROUND_OPTION_IDS[index],
        bet_amount,
      })),
    }))
    .sort((a, b) => b.round_id - a.round_id);
};
