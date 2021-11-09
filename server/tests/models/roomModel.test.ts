import Jest from 'jest';
import {Room} from '../../models/roomModel';
const { createServer } = require("http");
const { Server } = require("socket.io");
const Client = require("socket.io-client");

describe("tests for the room model", () => {
    
    let room: Room;
    let io: any, serverSocket: any, clientSocket: any; //usage of any here probably not a good use of typescript

    //see example on socket.io testing documentation page
    beforeAll((done) => {
        const httpServer = createServer();
        io = new Server(httpServer);
        httpServer.listen(()=>{
            const port = httpServer.address().port;
            clientSocket = new Client(`http://localhost:${port}`);
            io.on("connection",(socket:any)=>{
                serverSocket = socket;
            });
            clientSocket.on("connect",done)
        })
    });

    afterAll(()=>{
        io.close();
        clientSocket.close();
    });

    test("should generate a random alphanumeric roomcode of length 6 on instantiation", (done)=>{

        serverSocket.on('test_event', () => {
            room = new Room(serverSocket);
            expect(room.roomId).toHaveLength(6);
            done();
        });
        clientSocket.emit("test_event");
        
    });

    test("should add the calling player socket to the array of players in the room",(done)=>{
        
        serverSocket.on('test_event', () => {
            room = new Room(serverSocket);
            expect(room.players.has(serverSocket.id)).toEqual(true);
            done();
        });
        clientSocket.emit('test_event');
    })
    
})    

