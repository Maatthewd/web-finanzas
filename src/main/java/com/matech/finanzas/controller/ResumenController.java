package com.matech.finanzas.controller;

import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.projection.ResumenCategoria;
import com.matech.finanzas.service.ResumenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/resumen")
@RequiredArgsConstructor
@Tag(name = "Resúmenes", description = "Endpoints para obtener resúmenes financieros")
public class ResumenController {

    private final ResumenService resumenService;

    @GetMapping("/ingresos")
    @Operation(summary = "Obtener total de ingresos pagados")
    public ResponseEntity<BigDecimal> ingresos() {
        return ResponseEntity.ok(resumenService.obtenerTotalIngresos());
    }

    @GetMapping("/egresos")
    @Operation(summary = "Obtener total de egresos pagados")
    public ResponseEntity<BigDecimal> egresos() {
        return ResponseEntity.ok(resumenService.obtenerTotalEgresos());
    }

    @GetMapping("/balance")
    @Operation(summary = "Obtener balance general (ingresos - egresos)")
    public ResponseEntity<BigDecimal> balance() {
        return ResponseEntity.ok(resumenService.obtenerBalance());
    }

    @GetMapping("/deudas")
    @Operation(summary = "Obtener total de deudas pendientes")
    public ResponseEntity<BigDecimal> deudasPendientes() {
        return ResponseEntity.ok(resumenService.obtenerDeudasPendientes());
    }

    @GetMapping("/categorias")
    @Operation(summary = "Obtener totales por categoría")
    public ResponseEntity<List<ResumenCategoria>> porCategoria() {
        return ResponseEntity.ok(resumenService.obtenerTotalesPorCategoria());
    }

    @GetMapping("/rango")
    @Operation(summary = "Obtener total por rango de fechas")
    public ResponseEntity<BigDecimal> porRango(
            @RequestParam TipoMovimiento tipo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalPorRango(tipo, inicio, fin));
    }

    // Nuevos endpoints para resúmenes por día/mes/año

    @GetMapping("/dia")
    @Operation(summary = "Obtener total por día específico")
    public ResponseEntity<BigDecimal> porDia(
            @RequestParam TipoMovimiento tipo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalPorDia(tipo, fecha));
    }

    @GetMapping("/dia/balance")
    @Operation(summary = "Obtener balance de un día específico")
    public ResponseEntity<BigDecimal> balancePorDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha
    ) {
        return ResponseEntity.ok(resumenService.obtenerBalancePorDia(fecha));
    }

    @GetMapping("/mes")
    @Operation(summary = "Obtener total por mes")
    public ResponseEntity<BigDecimal> porMes(
            @RequestParam TipoMovimiento tipo,
            @RequestParam int anio,
            @RequestParam int mes
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalPorMes(tipo, anio, mes));
    }

    @GetMapping("/mes/balance")
    @Operation(summary = "Obtener balance del mes")
    public ResponseEntity<BigDecimal> balancePorMes(
            @RequestParam int anio,
            @RequestParam int mes
    ) {
        return ResponseEntity.ok(resumenService.obtenerBalancePorMes(anio, mes));
    }

    @GetMapping("/anio")
    @Operation(summary = "Obtener total por año")
    public ResponseEntity<BigDecimal> porAnio(
            @RequestParam TipoMovimiento tipo,
            @RequestParam int anio
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalPorAnio(tipo, anio));
    }

    @GetMapping("/anio/balance")
    @Operation(summary = "Obtener balance del año")
    public ResponseEntity<BigDecimal> balancePorAnio(@RequestParam int anio) {
        return ResponseEntity.ok(resumenService.obtenerBalancePorAnio(anio));
    }
}
