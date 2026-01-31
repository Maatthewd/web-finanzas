package com.matech.finanzas.repository;

import com.matech.finanzas.entity.Notificacion;
import com.matech.finanzas.entity.TipoNotificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {

    List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);

    List<Notificacion> findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(Long usuarioId);

    @Query("SELECT COUNT(n) FROM Notificacion n WHERE n.usuario.id = :usuarioId AND n.leida = false")
    Long countNotificacionesNoLeidas(@Param("usuarioId") Long usuarioId);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true, n.fechaLectura = :fechaLectura WHERE n.id = :id")
    void marcarComoLeida(@Param("id") Long id, @Param("fechaLectura") LocalDateTime fechaLectura);

    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true, n.fechaLectura = :fechaLectura WHERE n.usuario.id = :usuarioId AND n.leida = false")
    void marcarTodasComoLeidas(@Param("usuarioId") Long usuarioId, @Param("fechaLectura") LocalDateTime fechaLectura);

    @Query("""
        SELECT COUNT(n) > 0 FROM Notificacion n
        WHERE n.movimiento.id = :movimientoId
        AND n.tipo = :tipo
        AND n.fechaCreacion > :desde
    """)
    boolean existeNotificacionReciente(
        @Param("movimientoId") Long movimientoId,
        @Param("tipo") TipoNotificacion tipo,
        @Param("desde") LocalDateTime desde
    );
}