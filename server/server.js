const { instrument } = require("@socket.io/admin-ui");

const io = require("socket.io")(3000, {
	cors: {
		origin: ["http://localhost:8080", "https://admin.socket.io"],
	},
});

const userIo = io.of("/user"); // to set custom namespace
userIo.on("connection", (socket) => {
	console.log("connected to user Namespace with Username " + socket.username);
});

userIo.use((socket, next) => {
	//authentication middleware for admin
	if (socket.handshake.auth.token) {
		socket.username = getUserNameFromToken(socket.handshake.auth.token);
		next();
	} else {
		next(new Error("Please Send Token"));
	}
});

function getUserNameFromToken(token) {
	return token;
}

io.on("connection", (socket) => {
	console.log(socket.id);
	socket.on("send-message", (message, room) => {
		if (room === "") {
			socket.broadcast.emit("recieve-message", message); //broadcast will send the message to all the clients
			// other then himself
		} else {
			socket.to(room).emit("recieve-message", message); //using .to means it will already done the broadcasting to the specfic user
		}

		console.log(message);
	});
	socket.on("join-room", (room, cb) => {
		socket.join(room);
		cb(`Joined Room with id:${room}`);
	});
	socket.on("ping", (n) => console.log(n));
});

instrument(io, { auth: false });
