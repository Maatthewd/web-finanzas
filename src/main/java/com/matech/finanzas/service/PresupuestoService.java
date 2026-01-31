package com.matech.finanzas.service;

import com.matech.finanzas.dto.PresupuestoDTO;
import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.entity.Presupuesto;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.exception.ResourceNotFoundException;
import com.matech.finanzas.exception.ValidationException;
import com.matech.finanzas.mapper.PresupuestoMapper;
import com.matech.finanzas.repository.CategoriaRepository;
import com.matech.finanzas.repository.MovimientoRepository;
import com.matech.finanzas.repository.PresupuestoRepository;
import com.matech.finanzas.repository.UsuarioRepository;
import com.matech.finanzas.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PresupuestoService {

    private final PresupuestoRepository presupuestoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final MovimientoRepository movimientoRepository;
    private final PresupuestoMapper presupuestoMapper;
    private final NotificacionService notificacionService;

    @Transactional
    public PresupuestoDTO crear(PresupuestoDTO dto) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        // Validar que no exista otro presupuesto para la misma categoría/mes/año
        if (dto.getCategoriaId() != null) {
            var existente = presupuestoRepository.findByUsuarioAndCategoriaAndMesAnio(
                    usuarioId, dto.getCategoriaId(), dto.getMes(), dto.getAnio()
            );
            if (existente.isPresent()) {
                throw new ValidationException(
                        "Ya existe un presupuesto para esta categoría en el mes/año seleccionado");
            }
        }

        Presupuesto presupuesto = presupuestoMapper.toEntity(dto);
        presupuesto.setUsuario(usuario);

        if (dto.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", dto.getCategoriaId()));
            presupuesto.setCategoria(categoria);
        }

        Presupuesto saved = presupuestoRepository.save(presupuesto);
        return calcularEstadoPresupuesto(saved);
    }

    public List<PresupuestoDTO> listar() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return presupuestoRepository.findByUsuarioId(usuarioId)
                .stream()
                .map(this::calcularEstadoPresupuesto)
                .collect(Collectors.toList());
    }

    public List<PresupuestoDTO> listarActivos() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return presupuestoRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .stream()
                .map(this::calcularEstadoPresupuesto)
                .collect(Collectors.toList());
    }

    public List<PresupuestoDTO> obtenerPresupuestosMesActual() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        java.time.LocalDate hoy = java.time.LocalDate.now();

        return presupuestoRepository.findByUsuarioAndMesAnio(
                usuarioId, hoy.getMonthValue(), hoy.getYear())
                .stream()
                .map(this::calcularEstadoPresupuesto)
                .collect(Collectors.toList());
    }

    public PresupuestoDTO obtenerPorId(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Presupuesto presupuesto = presupuestoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto", "id", id));

        if (!presupuesto.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para ver este presupuesto");
        }

        return calcularEstadoPresupuesto(presupuesto);
    }

    @Transactional
    public PresupuestoDTO actualizar(Long id, PresupuestoDTO dto) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Presupuesto existente = presupuestoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto", "id", id));

        if (!existente.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para actualizar este presupuesto");
        }

        existente.setNombre(dto.getNombre());
        existente.setMontoLimite(dto.getMontoLimite());
        existente.setMes(dto.getMes());
        existente.setAnio(dto.getAnio());
        existente.setAlertaPorcentaje(dto.getAlertaPorcentaje());
        existente.setActivo(dto.isActivo());

        if (dto.getCategoriaId() != null) {
            Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", dto.getCategoriaId()));
            existente.setCategoria(categoria);
        } else {
            existente.setCategoria(null);
        }

        Presupuesto actualizado = presupuestoRepository.save(existente);
        return calcularEstadoPresupuesto(actualizado);
    }

    @Transactional
    public void eliminar(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Presupuesto presupuesto = presupuestoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Presupuesto", "id", id));

        if (!presupuesto.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para eliminar este presupuesto");
        }

        presupuestoRepository.deleteById(id);
    }

    /**
     * Calcula el gasto actual y el estado del presupuesto
     */
    private PresupuestoDTO calcularEstadoPresupuesto(Presupuesto presupuesto) {
        Long usuarioId = presupuesto.getUsuario().getId();

        // Calcular el gasto total del mes
        BigDecimal montoGastado;

        if (presupuesto.getCategoria() != null) {
            // Presupuesto por categoría
            montoGastado = movimientoRepository.totalPorMes(
                    TipoMovimiento.EGRESO,
                    presupuesto.getAnio(),
                    presupuesto.getMes(),
                    usuarioId
            );
        } else {
            // Presupuesto general
            montoGastado = movimientoRepository.totalPorMes(
                    TipoMovimiento.EGRESO,
                    presupuesto.getAnio(),
                    presupuesto.getMes(),
                    usuarioId
            );
        }

        BigDecimal montoDisponible = presupuesto.getMontoLimite().subtract(montoGastado);

        // Calcular porcentaje utilizado
        double porcentajeUtilizado = 0;
        if (presupuesto.getMontoLimite().compareTo(BigDecimal.ZERO) > 0) {
            porcentajeUtilizado = montoGastado
                    .multiply(BigDecimal.valueOf(100))
                    .divide(presupuesto.getMontoLimite(), 2, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        // Crear notificaciones si es necesario
        verificarYCrearNotificaciones(presupuesto, porcentajeUtilizado);

        PresupuestoDTO dto = presupuestoMapper.toDTO(presupuesto);
        dto.setMontoGastado(montoGastado);
        dto.setMontoDisponible(montoDisponible);
        dto.setPorcentajeUtilizado(porcentajeUtilizado);

        return dto;
    }

    private void verificarYCrearNotificaciones(Presupuesto presupuesto, double porcentajeUtilizado) {
        if (!presupuesto.isActivo()) {
            return;
        }

        try {
            if (porcentajeUtilizado >= 100) {
                notificacionService.crearNotificacionPresupuestoSuperado(presupuesto);
            } else if (porcentajeUtilizado >= presupuesto.getAlertaPorcentaje()) {
                notificacionService.crearNotificacionPresupuestoAlerta(
                        presupuesto, porcentajeUtilizado);
            }
        } catch (Exception e) {
            log.error("Error al crear notificación de presupuesto: {}", e.getMessage());
        }
    }
}