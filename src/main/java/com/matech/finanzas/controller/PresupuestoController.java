package com.matech.finanzas.controller;

import com.matech.finanzas.dto.PresupuestoDTO;
import com.matech.finanzas.service.PresupuestoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/presupuestos")
@RequiredArgsConstructor
@Tag(name = "Presupuestos", description = "Gestión de presupuestos mensuales")
public class PresupuestoController {

    private final PresupuestoService presupuestoService;

    @PostMapping
    @Operation(summary = "Crear nuevo presupuesto")
    public ResponseEntity<PresupuestoDTO> crear(@Valid @RequestBody PresupuestoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(presupuestoService.crear(dto));
    }

    @GetMapping
    @Operation(summary = "Listar todos los presupuestos del usuario")
    public ResponseEntity<List<PresupuestoDTO>> listar() {
        return ResponseEntity.ok(presupuestoService.listar());
    }

    @GetMapping("/activos")
    @Operation(summary = "Listar presupuestos activos")
    public ResponseEntity<List<PresupuestoDTO>> listarActivos() {
        return ResponseEntity.ok(presupuestoService.listarActivos());
    }

    @GetMapping("/mes-actual")
    @Operation(summary = "Obtener presupuestos del mes actual")
    public ResponseEntity<List<PresupuestoDTO>> obtenerPresupuestosMesActual() {
        return ResponseEntity.ok(presupuestoService.obtenerPresupuestosMesActual());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener presupuesto por ID")
    public ResponseEntity<PresupuestoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(presupuestoService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar presupuesto")
    public ResponseEntity<PresupuestoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody PresupuestoDTO dto
    ) {
        return ResponseEntity.ok(presupuestoService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar presupuesto")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        presupuestoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}