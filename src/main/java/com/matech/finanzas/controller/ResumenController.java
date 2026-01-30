package com.matech.finanzas.controller;

import com.matech.finanzas.projection.ResumenCategoria;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.service.ResumenService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/resumen")
@RequiredArgsConstructor
public class ResumenController {

    private final ResumenService resumenService;

    @GetMapping("/ingresos")
    public BigDecimal ingresos() {
        return resumenService.obtenerTotalIngresos();
    }

    @GetMapping("/egresos")
    public BigDecimal egresos() {
        return resumenService.obtenerTotalEgresos();
    }

    @GetMapping("/balance")
    public BigDecimal balance() {
        return resumenService.obtenerBalance();
    }

    @GetMapping("/deudas")
    public BigDecimal deudasPendientes() {
        return resumenService.obtenerDeudasPendientes();
    }

    @GetMapping("/categorias")
    public List<ResumenCategoria> porCategoria() {
        return resumenService.obtenerTotalesPorCategoria();
    }

    @GetMapping("/rango")
    public BigDecimal porRango(
            @RequestParam TipoMovimiento tipo,
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fin
    ) {
        return resumenService.obtenerTotalPorRango(tipo, inicio, fin);
    }

}
