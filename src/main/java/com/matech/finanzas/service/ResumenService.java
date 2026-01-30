package com.matech.finanzas.service;

import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.projection.ResumenCategoria;
import com.matech.finanzas.repository.MovimientoRepository;
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

    public BigDecimal obtenerTotalIngresos() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return movimientoRepository.totalIngresosPagados(usuarioId);
    }

    public BigDecimal obtenerTotalEgresos() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return movimientoRepository.totalEgresosPagados(usuarioId);
    }

    public BigDecimal obtenerBalance() {
        return obtenerTotalIngresos().subtract(obtenerTotalEgresos());
    }

    public BigDecimal obtenerDeudasPendientes() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return movimientoRepository.totalDeudasPendientes(usuarioId);
    }

    public List<ResumenCategoria> obtenerTotalesPorCategoria() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return movimientoRepository.totalPorCategoria(usuarioId);
    }

    public BigDecimal obtenerTotalPorRango(TipoMovimiento tipo, LocalDate inicio, LocalDate fin) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return movimientoRepository.totalPorFecha(tipo, inicio, fin, usuarioId);
    }

    // Nuevos métodos para resúmenes por día/mes/año

    public BigDecimal obtenerTotalPorDia(TipoMovimiento tipo, LocalDate fecha) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return movimientoRepository.totalPorDia(
                tipo,
                fecha.getYear(),
                fecha.getMonthValue(),
                fecha.getDayOfMonth(),
                usuarioId
        );
    }

    public BigDecimal obtenerTotalPorMes(TipoMovimiento tipo, int anio, int mes) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return movimientoRepository.totalPorMes(tipo, anio, mes, usuarioId);
    }

    public BigDecimal obtenerTotalPorAnio(TipoMovimiento tipo, int anio) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return movimientoRepository.totalPorAnio(tipo, anio, usuarioId);
    }

    public BigDecimal obtenerBalancePorDia(LocalDate fecha) {
        BigDecimal ingresos = obtenerTotalPorDia(TipoMovimiento.INGRESO, fecha);
        BigDecimal egresos = obtenerTotalPorDia(TipoMovimiento.EGRESO, fecha);
        return ingresos.subtract(egresos);
    }

    public BigDecimal obtenerBalancePorMes(int anio, int mes) {
        BigDecimal ingresos = obtenerTotalPorMes(TipoMovimiento.INGRESO, anio, mes);
        BigDecimal egresos = obtenerTotalPorMes(TipoMovimiento.EGRESO, anio, mes);
        return ingresos.subtract(egresos);
    }

    public BigDecimal obtenerBalancePorAnio(int anio) {
        BigDecimal ingresos = obtenerTotalPorAnio(TipoMovimiento.INGRESO, anio);
        BigDecimal egresos = obtenerTotalPorAnio(TipoMovimiento.EGRESO, anio);
        return ingresos.subtract(egresos);
    }
}
