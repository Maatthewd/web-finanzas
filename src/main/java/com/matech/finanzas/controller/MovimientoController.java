package com.matech.finanzas.controller;

import com.matech.finanzas.dto.MovimientoDTO;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.service.MovimientoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/movimientos")
@RequiredArgsConstructor
@Tag(name = "Movimientos", description = "Gestión de movimientos financieros (ingresos y egresos)")
public class MovimientoController {

    private final MovimientoService movimientoService;

    @PostMapping
    @Operation(summary = "Crear nuevo movimiento")
    public ResponseEntity<MovimientoDTO> crear(@Valid @RequestBody MovimientoDTO dto) {
        MovimientoDTO created = movimientoService.crear(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping
    @Operation(summary = "Listar movimientos con paginación y filtro por workspace")
    public ResponseEntity<Page<MovimientoDTO>> listar(
            @RequestParam(required = false) Long workspaceId,
            @PageableDefault(size = 20, sort = "fecha", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        return ResponseEntity.ok(movimientoService.listar(workspaceId, pageable));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener movimiento por ID")
    public ResponseEntity<MovimientoDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(movimientoService.obtenerPorId(id));
    }

    @GetMapping("/filtrar")
    @Operation(summary = "Filtrar movimientos por múltiples criterios incluyendo workspace")
    public ResponseEntity<List<MovimientoDTO>> filtrar(
            @RequestParam(required = false) TipoMovimiento tipo,
            @RequestParam(required = false) Boolean pagado,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(required = false) Long workspaceId
    ) {
        return ResponseEntity.ok(
            movimientoService.filtrar(tipo, pagado, categoriaId, inicio, fin, workspaceId)
        );
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar movimiento completo")
    public ResponseEntity<MovimientoDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody MovimientoDTO dto
    ) {
        return ResponseEntity.ok(movimientoService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/pagar")
    @Operation(summary = "Marcar movimiento como pagado")
    public ResponseEntity<Void> pagar(@PathVariable Long id) {
        movimientoService.pagarMovimiento(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/pendiente")
    @Operation(summary = "Marcar movimiento como pendiente")
    public ResponseEntity<Void> marcarPendiente(@PathVariable Long id) {
        movimientoService.marcarPendiente(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar movimiento")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        movimientoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}