import { useState, useEffect } from 'react';

export default function App() {
  const [socket, setSocket] = useState(null);
  const [user, setUser] = useState('');
  const [logeado, setLogeado] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    // Conexión con el WebSocket nativo del navegador
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    const BACKEND_URL = isLocal
      ? 'ws://localhost:8080'
      : 'wss://servidor-websocket-t6y7.onrender.com';

    const ws = new WebSocket(BACKEND_URL);

    ws.onopen = () => {
      console.log('Conectado al servidor WebSocket');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.type === 'message' || data.type === 'system') {
        setMessages((prev) => [...prev, data]);
      }

      if (data.type === 'user_list') {
        setUsuarios(data.users);
      }
    };

    ws.onclose = () => {
      console.log('Desconectado del servidor WebSocket');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (user.trim() && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: 'login', user: user.trim() }));
      setLogeado(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim() && socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          type: 'message',
          user: user,
          message: message.trim(),
        })
      );
      setMessage('');
    }
  };

  if (!logeado) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        <form onSubmit={handleLogin} style={{ border: '1px solid #ccc', padding: '24px', borderRadius: '8px', width: '300px' }}>
          <h2>Unirse al Chat</h2>
          <input
            type="text"
            placeholder="Tu nombre de usuario..."
            value={user}
            onChange={(e) => setUser(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '12px', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '20px', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      {/* Sidebar de Usuarios */}
      <div style={{ width: '200px', borderRight: '1px solid #eee', paddingRight: '16px' }}>
        <h3>🟢 Conectados ({usuarios.length})</h3>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {usuarios.map((u, i) => (
            <li key={i} style={{ padding: '6px 0', fontWeight: u === user ? 'bold' : 'normal' }}>
              {u} {u === user && '(Tú)'}
            </li>
          ))}
        </ul>
      </div>

      {/* Caja de Mensajes */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '500px' }}>
        <h2>Chat WebSocket</h2>
        <div style={{ flex: 1, border: '1px solid #ccc', padding: '12px', overflowY: 'auto', borderRadius: '6px', marginBottom: '12px' }}>
          {messages.map((item, idx) => {
            if (item.type === 'system') {
              return (
                <div key={idx} style={{ color: '#888', fontStyle: 'italic', textAlign: 'center', margin: '8px 0', fontSize: '14px' }}>
                  {item.text}
                </div>
              );
            }

            const esMio = item.user === user;
            return (
              <div key={idx} style={{ textAlign: esMio ? 'right' : 'left', margin: '8px 0' }}>
                <div
                  style={{
                    display: 'inline-block',
                    backgroundColor: esMio ? '#0070f3' : '#f1f1f1',
                    color: esMio ? '#fff' : '#000',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    maxWidth: '70%',
                  }}
                >
                  {!esMio && <strong style={{ display: 'block', fontSize: '12px', marginBottom: '2px' }}>{item.user}</strong>}
                  <span>{item.message}</span>
                </div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Escribe un mensaje..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Enviar
          </button>
        </form>
      </div>
    </div>
  );
}