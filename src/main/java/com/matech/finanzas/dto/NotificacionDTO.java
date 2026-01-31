package com.matech.finanzas.dto;

import com.matech.finanzas.entity.TipoNotificacion;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificacionDTO {
    private Long id;
    private String titulo;
    private String mensaje;
    private TipoNotificacion tipo;
    private Long movimientoId;
    private boolean leida;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaLectura;
}