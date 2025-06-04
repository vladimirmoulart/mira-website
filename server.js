// server.js

import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 3001 }) // Tu ouvres ton websocket sur le port 3001

// Quand un client se connecte
wss.on('connection', (ws) => {
  console.log('Nouvelle connexion WebSocket')

  // Quand le serveur reçoit un message du client
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString())

      if (data.type === 'join') {
        // On peut gérer des rooms si besoin (plus tard)
        ws.room = data.room
      }

      if (data.type === 'message') {
        // Re-broadcast le message à tous les clients connectés sur la même mission
        wss.clients.forEach(client => {
          if (client.readyState === 1 && client.room === data.room) {
            client.send(JSON.stringify({
              type: 'message',
              message: data.content,
            }))
          }
        })
      }
    } catch (err) {
      console.error('Erreur WebSocket :', err)
    }
  })

  ws.on('close', () => {
    console.log('Client déconnecté')
  })
})

console.log('Serveur WebSocket démarré sur ws://localhost:3001')
