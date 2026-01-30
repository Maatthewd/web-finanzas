package com.matech.finanzas.service;

import com.matech.finanzas.projection.ResumenCategoria;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.repository.MovimientoRepository;
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
        return movimientoRepository.totalIngresosPagados();
    }

    public BigDecimal obtenerTotalEgresos() {
        return movimientoRepository.totalEgresosPagados();
    }

    public BigDecimal obtenerBalance() {
        return obtenerTotalIngresos().subtract(obtenerTotalEgresos());
    }

    public BigDecimal obtenerDeudasPendientes() {
        return movimientoRepository.totalDeudasPendientes();
    }

    public List<ResumenCategoria> obtenerTotalesPorCategoria() {
        return movimientoRepository.totalPorCategoria();
    }

    public BigDecimal obtenerTotalPorRango(TipoMovimiento tipo, LocalDate inicio, LocalDate fin) {
        return movimientoRepository.totalPorFecha(tipo, inicio, fin);
    }
}
