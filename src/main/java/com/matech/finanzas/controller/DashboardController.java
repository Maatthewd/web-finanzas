package com.matech.finanzas.controller;

import com.matech.finanzas.dto.ResumenDashboardDTO;
import com.matech.finanzas.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Resumen general del dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    @Operation(summary = "Obtener resumen completo del dashboard (filtrable por workspace)")
    public ResponseEntity<ResumenDashboardDTO> obtenerResumen(
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(dashboardService.obtenerResumenDashboard(workspaceId));
    }
}