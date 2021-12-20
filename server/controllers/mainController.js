import LobbyController from "./lobbyController";
import GameController from "./gameController";
import chalk from 'chalk';

import {
    ioCreateRoom,
    ioEnterRoomCode,
    ioPlayerIsReady,
    ioStartGame,
    errorOccured
} from '../../client/reducers';
import {
    ioGetAllData
} from '../../client/reducers'

//Handles socket 
export default class MainController {
    constructor(io){
        this.io = io;
        this.lobbyController = new LobbyController(this.io);
        this.gameController = new GameController(this.io);

        this.io.on("connection", (socket) => {

            socket.on(ioCreateRoom.type,()=>{
                socket.join(this.lobbyController.createRoom(socket.id));
            });
    
            socket.on(ioEnterRoomCode.type,(enteredRoomCode)=>{
                 this.lobbyController.joinRoom(enteredRoomCode,socket);
            });

            socket.on("disconnect",()=>{
               this.lobbyController.playerLeft(socket.id)
            })

            socket.on(ioPlayerIsReady.type,(payload)=>{
                const updatedPlayers = this.lobbyController.updatePlayerReadiness(payload.playerId);
                this.lobbyController.rooms.get(payload.roomCode).updatePlayers(updatedPlayers);
                this.lobbyController.sendUpdatedPlayersToRoom(updatedPlayers,payload.roomCode);
            });

            socket.on(ioStartGame.type,(enteredRoomCode)=>{
                const room = this.lobbyController.getRoom(enteredRoomCode)
                if(room){
                    this.gameController.createGame(room);
                } else {
                    console.log(chalk.red('Tried to create a gameController without valid room object passed. Passed to function:'))
                    console.log(chalk.red(room))
                }
            })

            socket.on(ioGetAllData.type,(enteredRoomCode)=>{
                if(this.lobbyController.checkRoomExists(enteredRoomCode)){
                    this.lobbyController.emitAllRoomData(enteredRoomCode,socket.id)
                } else {
                    io.to(socket.id).emit(errorOccured.type,'No Such Room Exists...');
                }
            })
        });
    }
}