import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '../services/socket';

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-init-1',
    title: 'Prestadores Pendientes',
    message: 'Existen solicitudes de validación de prestadores turísticos por revisar en el panel.',
    time: 'Hoy',
    isRead: false,
    type: 'prestador',
  },
  {
    id: 'notif-init-2',
    title: 'Actualización de Requisitos RTN',
    message: 'Se ha publicado la circular de actualización para prestadores turísticos de COTATUR.',
    time: 'Ayer',
    isRead: true,
    type: 'sistema',
  },
  {
    id: 'notif-init-3',
    title: 'Bienvenida al Portal COTATUR',
    message: 'Sistema de Notificaciones en tiempo real activo y conectado.',
    time: 'Hace 2 días',
    isRead: true,
    type: 'sistema',
  },
];

export function NotificationCenter({ pendingCount }) {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef(null);

  // Cargar notificaciones y su estado de lectura de localStorage
  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('cotatur_notifications_list');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  // Guardar notificaciones en localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cotatur_notifications_list', JSON.stringify(notifications));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [notifications]);

  // Sincronizar pendientes iniciales si hay prestadores pendientes
  useEffect(() => {
    if (pendingCount > 0) {
      setNotifications((prev) => {
        const exists = prev.some((n) => n.id === 'notif-pending-sync');
        if (!exists) {
          return [
            {
              id: 'notif-pending-sync',
              title: 'Prestadores en Espera',
              message: `Tienes ${pendingCount} prestadores esperando validación.`,
              time: 'Ahora',
              isRead: false,
              type: 'prestador',
            },
            ...prev,
          ];
        }
        return prev;
      });
    }
  }, [pendingCount]);

  // Escuchar notificaciones en tiempo real vía WebSocket
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewPrestador = (data) => {
      const newNotif = {
        id: `notif-p-${Date.now()}`,
        title: 'Nuevo Prestador Registrado',
        message: `${data.nombre || 'Nuevo prestador'} se ha registrado en el sistema.`,
        time: 'Justo ahora',
        isRead: false,
        type: 'prestador',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    };

    const handleNewConsulta = (data) => {
      const newNotif = {
        id: `notif-c-${Date.now()}`,
        title: 'Nueva Consulta Ciudadana',
        message: `De ${data.nombre || 'Ciudadano'}: "${(data.asunto || data.mensaje || '').slice(0, 50)}..."`,
        time: 'Justo ahora',
        isRead: false,
        type: 'consulta',
      };
      setNotifications((prev) => [newNotif, ...prev]);
    };

    socket.on('new-prestador', handleNewPrestador);
    socket.on('new-consulta', handleNewConsulta);

    return () => {
      socket.off('new-prestador', handleNewPrestador);
      socket.off('new-consulta', handleNewConsulta);
    };
  }, []);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const markSingleAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotif = (id, e) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="notification-center-container" ref={popoverRef} style={{ position: 'relative' }}>
      {/* Botón de la Campana */}
      <button
        className="btn-notification"
        onClick={() => setIsOpen(!isOpen)}
        title="Centro de Notificaciones"
        aria-label="Centro de Notificaciones"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>

        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Ventana Popover de Notificaciones */}
      {isOpen && (
        <div
          className="notification-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '340px',
            maxHeight: '440px',
            backgroundColor: 'var(--color-bg-card, #ffffff)',
            border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: '16px',
            boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Cabecera Popover */}
          <div
            style={{
              padding: '14px 16px',
              borderBottom: '1px solid var(--color-border, #e2e8f0)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: '700', fontSize: '14px' }}>Notificaciones</span>
              {unreadCount > 0 && (
                <span
                  style={{
                    backgroundColor: 'var(--color-primary, #16a34a)',
                    color: '#ffffff',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '12px',
                  }}
                >
                  {unreadCount} nuevas
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-primary, #16a34a)',
                  fontSize: '11px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                Marcar leídas
              </button>
            )}
          </div>

          {/* Lista Scrollable */}
          <div style={{ overflowY: 'auto', flex: 1, padding: '8px' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '30px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                No tienes notificaciones
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markSingleAsRead(n.id)}
                  style={{
                    padding: '12px',
                    borderRadius: '10px',
                    marginBottom: '6px',
                    backgroundColor: n.isRead ? 'transparent' : 'rgba(22, 163, 74, 0.08)',
                    borderLeft: n.isRead ? '3px solid transparent' : '3px solid var(--color-primary, #16a34a)',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    position: 'relative',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h5 style={{ margin: 0, fontSize: '13px', fontWeight: n.isRead ? '600' : '700' }}>
                      {n.title}
                    </h5>
                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{n.time}</span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--color-text-muted, #64748b)', lineHeight: '1.4' }}>
                    {n.message}
                  </p>

                  <button
                    onClick={(e) => deleteNotif(n.id, e)}
                    style={{
                      position: 'absolute',
                      bottom: '6px',
                      right: '8px',
                      background: 'none',
                      border: 'none',
                      color: '#cbd5e1',
                      fontSize: '12px',
                      cursor: 'pointer',
                    }}
                    title="Eliminar"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Pie de Popover */}
          <div
            style={{
              padding: '8px 16px',
              borderTop: '1px solid var(--color-border, #e2e8f0)',
              textAlign: 'center',
              backgroundColor: 'var(--color-bg-subtle, #f8fafc)',
            }}
          >
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>WebSocket en vivo activo 🟢</span>
          </div>
        </div>
      )}
    </div>
  );
}
