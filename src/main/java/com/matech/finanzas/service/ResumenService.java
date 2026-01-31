package com.matech.finanzas.service;

import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.entity.Workspace;
import com.matech.finanzas.exception.ResourceNotFoundException;
import com.matech.finanzas.exception.ValidationException;
import com.matech.finanzas.projection.ResumenCategoria;
import com.matech.finanzas.repository.MovimientoRepository;
import com.matech.finanzas.repository.WorkspaceRepository;
import com.matech.finanzas.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResumenService {
    private final MovimientoRepository movimientoRepository;
    private final WorkspaceRepository workspaceRepository;

    public BigDecimal obtenerTotalIngresos(Long workspaceId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        verificarWorkspace(workspaceId, usuarioId);
        return movimientoRepository.totalIngresosPagados(usuarioId, workspaceId);
    }

    public BigDecimal obtenerTotalEgresos(Long workspaceId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        verificarWorkspace(workspaceId, usuarioId);
        return movimientoRepository.totalEgresosPagados(usuarioId, workspaceId);
    }

    public BigDecimal obtenerBalance(Long workspaceId) {
        return obtenerTotalIngresos(workspaceId).subtract(obtenerTotalEgresos(workspaceId));
    }

    public BigDecimal obtenerDeudasPendientes(Long workspaceId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        verificarWorkspace(workspaceId, usuarioId);
        return movimientoRepository.totalDeudasPendientes(usuarioId, workspaceId);
    }

    public List<ResumenCategoria> obtenerTotalesPorCategoria(Long workspaceId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        verificarWorkspace(workspaceId, usuarioId);
        return movimientoRepository.totalPorCategoria(usuarioId, workspaceId);
    }

    public BigDecimal obtenerTotalPorRango(TipoMovimiento tipo, LocalDate inicio,
                                           LocalDate fin, Long workspaceId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        verificarWorkspace(workspaceId, usuarioId);
        return movimientoRepository.totalPorFecha(tipo, inicio, fin, usuarioId, workspaceId);
    }

    // Nuevos métodos para resúmenes por día/mes/año con workspace

    public BigDecimal obtenerTotalPorDia(TipoMovimiento tipo, LocalDate fecha, Long workspaceId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        verificarWorkspace(workspaceId, usuarioId);
        return movimientoRepository.totalPorDia(
                tipo,
                fecha.getYear(),
                fecha.getMonthValue(),
                fecha.getDayOfMonth(),
                usuarioId,
                workspaceId
        );
    }

    public BigDecimal obtenerTotalPorMes(TipoMovimiento tipo, int anio, int mes, Long workspaceId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        verificarWorkspace(workspaceId, usuarioId);
        return movimientoRepository.totalPorMes(tipo, anio, mes, usuarioId, workspaceId);
    }

    public BigDecimal obtenerTotalPorAnio(TipoMovimiento tipo, int anio, Long workspaceId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        verificarWorkspace(workspaceId, usuarioId);
        return movimientoRepository.totalPorAnio(tipo, anio, usuarioId, workspaceId);
    }

    public BigDecimal obtenerBalancePorDia(LocalDate fecha, Long workspaceId) {
        BigDecimal ingresos = obtenerTotalPorDia(TipoMovimiento.INGRESO, fecha, workspaceId);
        BigDecimal egresos = obtenerTotalPorDia(TipoMovimiento.EGRESO, fecha, workspaceId);
        return ingresos.subtract(egresos);
    }

    public BigDecimal obtenerBalancePorMes(int anio, int mes, Long workspaceId) {
        BigDecimal ingresos = obtenerTotalPorMes(TipoMovimiento.INGRESO, anio, mes, workspaceId);
        BigDecimal egresos = obtenerTotalPorMes(TipoMovimiento.EGRESO, anio, mes, workspaceId);
        return ingresos.subtract(egresos);
    }

    public BigDecimal obtenerBalancePorAnio(int anio, Long workspaceId) {
        BigDecimal ingresos = obtenerTotalPorAnio(TipoMovimiento.INGRESO, anio, workspaceId);
        BigDecimal egresos = obtenerTotalPorAnio(TipoMovimiento.EGRESO, anio, workspaceId);
        return ingresos.subtract(egresos);
    }

    private void verificarWorkspace(Long workspaceId, Long usuarioId) {
        if (workspaceId != null) {
            Workspace workspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

            if (!workspace.getUsuario().getId().equals(usuarioId)) {
                throw new ValidationException("El workspace no pertenece al usuario");
            }
        }
    }
}