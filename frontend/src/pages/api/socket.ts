import { IGame } from "@utils/game/IGame";
import { IGameState } from "@utils/game/IGameState";
import { Server as IOServer } from "socket.io";

const handler = (req, res) => {
  let games = new Map<string, IGame>();

  let game!: IGame;

  const server = res.socket?.server;
  let io = server.io;

  if (!io) {
    const io = new IOServer(server);

    server.io = io;

    io.on("connection", (socket) => {
      socket.on("join_room", (msg) => {
        let roomID = msg;
        console.log("roomID:", roomID);
        // TODO: check valid roomID

        const socketRooms = Array.from(socket.rooms.values()).filter(
          (id) => id !== socket.id
        );

        if (socketRooms.length > 0) {
          socket.emit("room_join_error", {
            error: "you are already in a room",
          });
        } else {
          socket.join(roomID);

          if (!games.has(roomID)) {
            games.set(roomID, { p1: undefined, p2: undefined });
          }
          game = games.get(roomID); // i fucking HATE TYPESCRIPT

          let state!: number;
          if (game.p1 === undefined) {
            state = 1;
            game.p1 = socket.id;
          } else if (game.p2 === undefined) {
            state = 2;
            game.p2 = socket.id;
          } else {
            state = 3;
          }
          socket.emit("state", state);
          // {
          //   io.to(roomID).emit(
          //     "broadcast",
          //     `player 1: ${game.p1} -- player 2: ${game.p2}`
          //   );

          //   const connectedSockets = io.sockets.adapter.rooms.get(roomID);

          //   io.to(roomID).emit(
          //     "broadcast",
          //     `spectators: \n${Array.from(connectedSockets.values()).filter(
          //       (socket) => socket !== game.p1 && socket !== game.p2
          //     )}\n`
          //   );
          //     const rooms = io.sockets.adapter.rooms;
          //     rooms.forEach((set, key) => {
          //       if (set.has(key)) rooms.delete(key);
          //     });

          //     // console.log("rooms: ", rooms);
          //     // io.to(roomID).emit("roomsCount", rooms.size);
          //     // io.to(roomID).emit("clientsCount", connectedSockets?.size);
          // }
          if (state === 3) return;
          if (game.p1 && game.p2) {
            io.to(game.p1).to(game.p2).emit("ready");
          }

          games.set(roomID, game);
        }
      });
      console.log("hahahahahahahahha");
      
      socket.on("move", (dir) => {
        if (socket.id === game.p1) {
          const roomID = Array.from(socket.rooms.values()).find(
            (id) => id !== socket.id
          );

          io.to(roomID).emit("moved", { p1: dir, p2: undefined }); // diha fmok
        } else if (socket.id === game.p2) {
          const roomID = Array.from(socket.rooms.values()).find(
            (id) => id !== socket.id
          );

          io.to(roomID).emit("moved", { p2: dir, p1: undefined }); // diha fmok
        }
      });
      socket.on("start_game", () => {
        const roomID = Array.from(socket.rooms.values()).find(
          (id) => id !== socket.id
        );
        io.to(roomID).emit("start_game"); // diha fmok
        // console.log("start_game", roomID);
      });

      socket.on("sync", (py, idx) => {
        // pls dont hak me
        const roomID = Array.from(socket.rooms.values()).find(
          (id) => id !== socket.id
        );
        socket.broadcast.to(roomID).emit("sync", py, idx);
      });

      socket.on("ball_sync", (newBall) => {
        // pls dont hak me
        const roomID = Array.from(socket.rooms.values()).find(
          (id) => id !== socket.id
        );
        socket.broadcast.to(roomID).emit("ball_sync", newBall);
      });

      socket.on("game_end", (win) => {
        // pls dont hak me
        const roomID = Array.from(socket.rooms.values()).find(
          (id) => id !== socket.id
        );
        socket.broadcast.to(roomID).emit("stop_game", win);
      });

      socket.on("get_info", () => socket.emit("get_info", games));

      socket.on("disconnecting", () => {
        const roomID = Array.from(socket.rooms.values()).find(
          (id) => id !== socket.id
        );
        if (game.p1 === socket.id) {
          game.p1 = game.p2;
          game.p2 = undefined;
        } else if (game.p2 === socket.id) {
          game.p2 = undefined;
        } else return;

        io.to(roomID).emit("stop_game");
        // console.log(`sending to ${game.p1} state wait`);
        if (game.p1 === undefined) return;

        io.to(game.p1).emit("state", 1);

        // console.log("io.sockets.sockets.get(game.p1) = ", io.sockets.sockets.get(game.p1))
        // io.sockets.sockets.get(game.p1)?.emit("state", "wait")
      });
    });
  }
  res.end();
};

export default handler;
