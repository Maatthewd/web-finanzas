package com.matech.finanzas.service;

import com.matech.finanzas.dto.NotificacionDTO;
import com.matech.finanzas.entity.*;
import com.matech.finanzas.exception.ResourceNotFoundException;
import com.matech.finanzas.mapper.NotificacionMapper;
import com.matech.finanzas.repository.NotificacionRepository;
import com.matech.finanzas.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final NotificacionMapper notificacionMapper;

    public List<NotificacionDTO> listarTodas() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return notificacionRepository.findByUsuarioIdOrderByFechaCreacionDesc(usuarioId)
                .stream()
                .map(notificacionMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<NotificacionDTO> listarNoLeidas() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return notificacionRepository.findByUsuarioIdAndLeidaFalseOrderByFechaCreacionDesc(usuarioId)
                .stream()
                .map(notificacionMapper::toDTO)
                .collect(Collectors.toList());
    }

    public Long contarNoLeidas() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return notificacionRepository.countNotificacionesNoLeidas(usuarioId);
    }

    @Transactional
    public void marcarComoLeida(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación", "id", id));

        if (!notificacion.getUsuario().getId().equals(usuarioId)) {
            throw new SecurityException("No tienes permiso para marcar esta notificación");
        }

        notificacionRepository.marcarComoLeida(id, LocalDateTime.now());
    }

    @Transactional
    public void marcarTodasComoLeidas() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        notificacionRepository.marcarTodasComoLeidas(usuarioId, LocalDateTime.now());
    }

    @Transactional
    public void eliminar(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Notificacion notificacion = notificacionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación", "id", id));

        if (!notificacion.getUsuario().getId().equals(usuarioId)) {
            throw new SecurityException("No tienes permiso para eliminar esta notificación");
        }

        notificacionRepository.deleteById(id);
    }

    /**
     * Crea notificación de vencimiento próximo (3 días antes)
     */
    @Transactional
    public void crearNotificacionVencimientoProximo(Movimiento movimiento) {
        // Verificar si ya existe una notificación reciente
        LocalDateTime hace24Horas = LocalDateTime.now().minusHours(24);
        if (notificacionRepository.existeNotificacionReciente(
                movimiento.getId(), TipoNotificacion.VENCIMIENTO_PROXIMO, hace24Horas)) {
            return;
        }

        Notificacion notificacion = Notificacion.builder()
                .titulo("Vencimiento Próximo")
                .mensaje(String.format("El movimiento '%s' vence en 3 días (%.2f)",
                        movimiento.getDescripcion(), movimiento.getMonto()))
                .tipo(TipoNotificacion.VENCIMIENTO_PROXIMO)
                .usuario(movimiento.getUsuario())
                .movimiento(movimiento)
                .build();

        notificacionRepository.save(notificacion);
        log.info("Notificación de vencimiento próximo creada para movimiento {}", movimiento.getId());
    }

    /**
     * Crea notificación de vencimiento hoy
     */
    @Transactional
    public void crearNotificacionVencimientoHoy(Movimiento movimiento) {
        LocalDateTime hace24Horas = LocalDateTime.now().minusHours(24);
        if (notificacionRepository.existeNotificacionReciente(
                movimiento.getId(), TipoNotificacion.VENCIMIENTO_HOY, hace24Horas)) {
            return;
        }

        Notificacion notificacion = Notificacion.builder()
                .titulo("¡Vence Hoy!")
                .mensaje(String.format("El movimiento '%s' vence hoy (%.2f)",
                        movimiento.getDescripcion(), movimiento.getMonto()))
                .tipo(TipoNotificacion.VENCIMIENTO_HOY)
                .usuario(movimiento.getUsuario())
                .movimiento(movimiento)
                .build();

        notificacionRepository.save(notificacion);
        log.info("Notificación de vencimiento hoy creada para movimiento {}", movimiento.getId());
    }

    /**
     * Crea notificación de vencimiento pasado
     */
    @Transactional
    public void crearNotificacionVencimientoPasado(Movimiento movimiento) {
        LocalDateTime hace24Horas = LocalDateTime.now().minusHours(24);
        if (notificacionRepository.existeNotificacionReciente(
                movimiento.getId(), TipoNotificacion.VENCIMIENTO_PASADO, hace24Horas)) {
            return;
        }

        Notificacion notificacion = Notificacion.builder()
                .titulo("Movimiento Vencido")
                .mensaje(String.format("El movimiento '%s' está vencido (%.2f)",
                        movimiento.getDescripcion(), movimiento.getMonto()))
                .tipo(TipoNotificacion.VENCIMIENTO_PASADO)
                .usuario(movimiento.getUsuario())
                .movimiento(movimiento)
                .build();

        notificacionRepository.save(notificacion);
        log.info("Notificación de vencimiento pasado creada para movimiento {}", movimiento.getId());
    }

    /**
     * Crea notificación de presupuesto superado
     */
    @Transactional
    public void crearNotificacionPresupuestoSuperado(Presupuesto presupuesto) {
        String nombreCategoria = presupuesto.getCategoria() != null ?
                presupuesto.getCategoria().getNombre() : "General";

        Notificacion notificacion = Notificacion.builder()
                .titulo("¡Presupuesto Superado!")
                .mensaje(String.format("El presupuesto '%s' (%s) ha sido superado",
                        presupuesto.getNombre(), nombreCategoria))
                .tipo(TipoNotificacion.PRESUPUESTO_SUPERADO)
                .usuario(presupuesto.getUsuario())
                .build();

        notificacionRepository.save(notificacion);
        log.info("Notificación de presupuesto superado creada para presupuesto {}", presupuesto.getId());
    }

    /**
     * Crea notificación de alerta de presupuesto
     */
    @Transactional
    public void crearNotificacionPresupuestoAlerta(Presupuesto presupuesto, double porcentajeUtilizado) {
        String nombreCategoria = presupuesto.getCategoria() != null ?
                presupuesto.getCategoria().getNombre() : "General";

        Notificacion notificacion = Notificacion.builder()
                .titulo("Alerta de Presupuesto")
                .mensaje(String.format("El presupuesto '%s' (%s) está al %.0f%% de su límite",
                        presupuesto.getNombre(), nombreCategoria, porcentajeUtilizado))
                .tipo(TipoNotificacion.PRESUPUESTO_ALERTA)
                .usuario(presupuesto.getUsuario())
                .build();

        notificacionRepository.save(notificacion);
        log.info("Notificación de alerta de presupuesto creada para presupuesto {}", presupuesto.getId());
    }
}