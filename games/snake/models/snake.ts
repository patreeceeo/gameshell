import { createMachine, assign } from "@xstate/fsm";

type TDirection = "UP" | "DOWN" | "LEFT" | "RIGHT";

type TPoint = [number, number];

interface TContext {
  direction: TDirection;
  points: TPoint[];
  length: number;
  deathTimer: number;
}

interface TSpawnEvent extends TContext {
  type: "SPAWN";
}

type TDieEvent = {
  type: "DIE";
};

type TEvent =
  | TSpawnEvent
  | TDieEvent
  | {
      type: "CHANGE_DIRECTION";
      direction: TDirection;
    }
  | {
      type: "CHANGE_LENGTH";
      amount: number;
    }
  | {
      type: "ADVANCE";
      amount: number;
    };

const handleSpawn = assign({
  points: (_: TContext, event: TSpawnEvent) => event.points,
  length: (_: TContext, event: TSpawnEvent) => event.length,
  deathTimer: 5,
});

const handleDeath = assign({
  deathTimer: ({ deathTimer }: TContext) => deathTimer - 1,
});

const handleChangeLength = assign({
  length: ({ length }: TContext, { amount }: any) => length + amount,
});

const handleChangeDirection = assign({
  direction: (_, { direction }: any) => direction,
  points: (context: TContext) => {
    const [head, ...rest] = context.points;
    const pivot = [...head];
    return [head, pivot, ...rest];
  },
});

function advanceHead(
  head: TPoint,
  amount: number,
  direction: TDirection
): TPoint {
  const [headX, headY] = head;
  switch (direction) {
    case "UP":
      return [headX, headY - amount];
    case "DOWN":
      return [headX, headY + amount];
    case "LEFT":
      return [headX - amount, headY];
    case "RIGHT":
      return [headX + amount, headY];
  }
}

export function countEmbodiedPoints(points: TPoint[], maxBodyLength: number) {
  return (
    points.reduce<{
      bodyLength: number;
      lastPoint: TPoint;
      count: number;
    }>(
      (acc, point) => {
        return acc.bodyLength < maxBodyLength
          ? {
              lastPoint: point,
              bodyLength:
                acc.bodyLength +
                Math.abs(point[0] - acc.lastPoint[0]) +
                Math.abs(point[1] - acc.lastPoint[1]),
              count: acc.count + 1,
            }
          : acc;
      },
      { bodyLength: 0, lastPoint: points[0], count: 0 }
    ).count - 1
  );
}

const handleAdvance = assign({
  points: (context: TContext, { amount }: any) => {
    const [head, ...rest] = context.points;
    const newPoints = [advanceHead(head, amount, context.direction), ...rest];
    return newPoints.slice(countEmbodiedPoints(newPoints, context.length));
  },
});

function notDeadYet(context: TContext) {
  return context.deathTimer > 0;
}

const snake = createMachine<TContext, TEvent>({
  id: "snake",
  initial: "Dead",
  context: {
    direction: "UP",
    points: [],
    length: 0,
    deathTimer: 0,
  },
  states: {
    Dead: {
      on: {
        SPAWN: {
          target: "Alive",
          actions: handleSpawn,
        },
      },
    },
    Alive: {
      on: {
        DIE: {
          target: "Dying",
        },
        CHANGE_LENGTH: {
          target: "Alive",
          actions: handleChangeLength,
        },
        CHANGE_DIRECTION: {
          target: "Alive",
          actions: handleChangeDirection,
        },
        ADVANCE: {
          target: "Alive",
          actions: handleAdvance,
        },
      },
    },
    Dying: {
      on: {
        DIE: [
          {
            target: "Dying",
            actions: handleDeath,
            cond: notDeadYet,
          },
          {
            target: "Dead",
          },
        ],
      },
    },
  },
});

export default snake;
