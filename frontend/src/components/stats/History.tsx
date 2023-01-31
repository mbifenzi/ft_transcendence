import React from "react";

import cn from "classnames";
import Image from "next/image";
import Link from "next/link";

import GamesHistoryModal from "@components/modals/GamesHistoryModal";
import { truncateString } from "@utils/format";

interface GameSummaryProps {
  player1: {
    username: string;
    avatar_url: string;
    score: number;
  };
  player2: {
    username: string;
    avatar_url: string;
    score: number;
  };
  gameId: string;
  gameDuration: string;
  gameTime: string;
}

const GamePlayer = (props: {
  username: string;
  avatar_url: string;
  score: number;
  isPlayer1: boolean;
}) => (
  <div
    className={cn(
      "flex gap-x-4 border-black px-3 py-3 w-full h-full items-center",
      {
        "border-r-1": props.isPlayer1,
        "flex-row-reverse border-l-1": !props.isPlayer1,
      }
    )}
  >
    <Link href={`/u/${props.username}`} className="flex items-center ">
      <div className="relative h-[60px] w-[60px] gap-4">
        <figure className="group absolute flex h-[60px] w-[60px] cursor-pointer items-center justify-center rounded-full bg-black transition">
          <Image
            src={props.avatar_url}
            alt={props.username + " avatar"}
            fill
            className="h-14 w-14 rounded-full object-cover"
          />
        </figure>
      </div>
    </Link>
    <div
      className={cn("flex w-full justify-between gap-x-2", {
        "flex-row-reverse": !props.isPlayer1,
      })}
    >
      <Link
        href={`/u/${props.username}`}
        className="overflow-hidden text-ellipsis whitespace-nowrap"
      >
        {truncateString(props.username, 10)}
      </Link>
      <p className="">{props.score}</p>
    </div>
  </div>
);

export const GameSummary = (props: GameSummaryProps) => (
  <div className="flex h-full w-full">
    <div className="py-2">
      <div
        className={cn("w-px h-full", {
          "bg-green-300": props.player1.score > props.player2.score,
          "bg-red-300": props.player1.score < props.player2.score,
        })}
      />
    </div>
    <div
      className={cn("grid grid-cols-2 w-full hover:shadow duration-200", {
        "shadow-green-300": props.player1.score > props.player2.score,
        "shadow-red-300": props.player1.score < props.player2.score,
      })}
    >
      <GamePlayer {...props.player1} isPlayer1 />
      <GamePlayer {...props.player2} isPlayer1={false} />
    </div>
  </div>
);

const LastGames = ({ username }: { username: string }) => {
  const [seeAll, setSeeAll] = React.useState(false);
  //   const { data, isLoading } = useSWR(`/stats/${username}/history`, fetcher);
  const sample = [
    {
      player1: {
        username: "Aristotle",
        avatar_url:
          "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZpSv4PVhx_Bc7QOyklw0fNTpHr6K1px9Rzw&usqp=CAU",
        score: 5,
      },
      player2: {
        username: "Plato",
        avatar_url:
          "https://images.saymedia-content.com/.image/c_limit%2Ccs_srgb%2Cq_auto:eco%2Cw_700/MTgwMDE1OTM1MjA4NjI5Mzcw/the-ancient-greek-philosopher-plato-his-life-and-works.webp",
        score: 4,
      },
      gameId: "123",
      gameDuration: "10",
      gameTime: "2021-09-01T12:00:00.000Z",
    },
  ];
  const isLoading = false && !!username;

  const data = Array.from(
    { length: 10 },
    () => sample[Math.floor(Math.random() * sample.length)]
  ).map((game) => {
    const score1 = Math.floor(Math.random() * 9);
    const score2 = 9 - score1;
    return {
      ...game,
      player1: {
        ...game.player1,
        score: score1,
      },
      player2: {
        ...game.player2,
        score: score2,
      },
      gameId:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
    };
  });

  return (
    <>
      <nav className="flex min-h-[400px] flex-col gap-y-4 rounded-xl border bg-white px-4 py-5 shadow-lg">
        <div className="flex items-center justify-between">
          <p className="text-xl font-bold text-gray-900">Recent Games</p>
          <button
            onClick={() => setSeeAll(true)}
            className="text-sm font-semibold text-primary"
          >
            See all
          </button>
        </div>
        <div className="h-px bg-gray-200 " />
        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <ul className="flex flex-col gap-y-2 ">
            {data.slice(0, 10).map((game) => (
              <li
                key={game.gameId}
                className="rounded-md border border-gray-100"
              >
                <GameSummary {...game} />
              </li>
            ))}
          </ul>
        )}
      </nav>
      {seeAll && (
        <GamesHistoryModal
          username={username}
          isOpen={seeAll}
          onClose={() => setSeeAll(false)}
        />
      )}
    </>
  );
};

export default LastGames;
