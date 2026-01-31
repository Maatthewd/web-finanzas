package com.matech.finanzas.mapper;

import com.matech.finanzas.dto.NotificacionDTO;
import com.matech.finanzas.entity.Notificacion;
import org.springframework.stereotype.Component;

@Component
public class NotificacionMapper {

    public NotificacionDTO toDTO(Notificacion notificacion) {
        if (notificacion == null) {
            return null;
        }

        return NotificacionDTO.builder()
                .id(notificacion.getId())
                .titulo(notificacion.getTitulo())
                .mensaje(notificacion.getMensaje())
                .tipo(notificacion.getTipo())
                .movimientoId(notificacion.getMovimiento() != null ?
                        notificacion.getMovimiento().getId() : null)
                .leida(notificacion.isLeida())
                .fechaCreacion(notificacion.getFechaCreacion())
                .fechaLectura(notificacion.getFechaLectura())
                .build();
    }
}