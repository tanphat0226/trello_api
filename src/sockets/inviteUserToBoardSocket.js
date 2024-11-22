// Initiate socket.io in the server
export const inviteUserToBoardSocket = (socket) => {
  // Listen to event 'FE_USER_INVITED_TO_BOARD'
  socket.on('FE_USER_INVITED_TO_BOARD', (invitation) => {
    // Emit event 'BE_USER_INVITED_TO_BOARD' to all clients except sender
    socket.broadcast.emit('BE_USER_INVITED_TO_BOARD', invitation)
  })
}
