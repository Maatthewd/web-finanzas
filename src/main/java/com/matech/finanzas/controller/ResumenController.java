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
    @Operation(summary = "Obtener total de ingresos pagados (filtrable por workspace)")
    public ResponseEntity<BigDecimal> ingresos(
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalIngresos(workspaceId));
    }

    @GetMapping("/egresos")
    @Operation(summary = "Obtener total de egresos pagados (filtrable por workspace)")
    public ResponseEntity<BigDecimal> egresos(
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalEgresos(workspaceId));
    }

    @GetMapping("/balance")
    @Operation(summary = "Obtener balance general (ingresos - egresos) (filtrable por workspace)")
    public ResponseEntity<BigDecimal> balance(
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerBalance(workspaceId));
    }

    @GetMapping("/deudas")
    @Operation(summary = "Obtener total de deudas pendientes (filtrable por workspace)")
    public ResponseEntity<BigDecimal> deudasPendientes(
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerDeudasPendientes(workspaceId));
    }

    @GetMapping("/categorias")
    @Operation(summary = "Obtener totales por categoría (filtrable por workspace)")
    public ResponseEntity<List<ResumenCategoria>> porCategoria(
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalesPorCategoria(workspaceId));
    }

    @GetMapping("/rango")
    @Operation(summary = "Obtener total por rango de fechas (filtrable por workspace)")
    public ResponseEntity<BigDecimal> porRango(
            @RequestParam TipoMovimiento tipo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalPorRango(tipo, inicio, fin, workspaceId));
    }

    // Nuevos endpoints para resúmenes por día/mes/año con workspace

    @GetMapping("/dia")
    @Operation(summary = "Obtener total por día específico (filtrable por workspace)")
    public ResponseEntity<BigDecimal> porDia(
            @RequestParam TipoMovimiento tipo,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalPorDia(tipo, fecha, workspaceId));
    }

    @GetMapping("/dia/balance")
    @Operation(summary = "Obtener balance de un día específico (filtrable por workspace)")
    public ResponseEntity<BigDecimal> balancePorDia(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerBalancePorDia(fecha, workspaceId));
    }

    @GetMapping("/mes")
    @Operation(summary = "Obtener total por mes (filtrable por workspace)")
    public ResponseEntity<BigDecimal> porMes(
            @RequestParam TipoMovimiento tipo,
            @RequestParam int anio,
            @RequestParam int mes,
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalPorMes(tipo, anio, mes, workspaceId));
    }

    @GetMapping("/mes/balance")
    @Operation(summary = "Obtener balance del mes (filtrable por workspace)")
    public ResponseEntity<BigDecimal> balancePorMes(
            @RequestParam int anio,
            @RequestParam int mes,
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerBalancePorMes(anio, mes, workspaceId));
    }

    @GetMapping("/anio")
    @Operation(summary = "Obtener total por año (filtrable por workspace)")
    public ResponseEntity<BigDecimal> porAnio(
            @RequestParam TipoMovimiento tipo,
            @RequestParam int anio,
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerTotalPorAnio(tipo, anio, workspaceId));
    }

    @GetMapping("/anio/balance")
    @Operation(summary = "Obtener balance del año (filtrable por workspace)")
    public ResponseEntity<BigDecimal> balancePorAnio(
            @RequestParam int anio,
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(resumenService.obtenerBalancePorAnio(anio, workspaceId));
    }
}