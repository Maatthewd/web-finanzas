package com.matech.finanzas.controller;

import com.matech.finanzas.dto.WorkspaceDTO;
import com.matech.finanzas.service.WorkspaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
@Tag(name = "Workspaces", description = "Gestión de espacios de trabajo (finanzas separadas)")
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    @PostMapping
    @Operation(summary = "Crear nuevo workspace")
    public ResponseEntity<WorkspaceDTO> crear(@Valid @RequestBody WorkspaceDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workspaceService.crear(dto));
    }

    @GetMapping
    @Operation(summary = "Listar todos los workspaces del usuario")
    public ResponseEntity<List<WorkspaceDTO>> listar() {
        return ResponseEntity.ok(workspaceService.listar());
    }

    @GetMapping("/activos")
    @Operation(summary = "Listar workspaces activos")
    public ResponseEntity<List<WorkspaceDTO>> listarActivos() {
        return ResponseEntity.ok(workspaceService.listarActivos());
    }

    @GetMapping("/principal")
    @Operation(summary = "Obtener workspace principal")
    public ResponseEntity<WorkspaceDTO> obtenerPrincipal() {
        return ResponseEntity.ok(workspaceService.obtenerPrincipal());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener workspace por ID")
    public ResponseEntity<WorkspaceDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(workspaceService.obtenerPorId(id));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar workspace")
    public ResponseEntity<WorkspaceDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody WorkspaceDTO dto
    ) {
        return ResponseEntity.ok(workspaceService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/principal")
    @Operation(summary = "Establecer workspace como principal")
    public ResponseEntity<Void> establecerComoPrincipal(@PathVariable Long id) {
        workspaceService.establecerComoPrincipal(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar workspace")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        workspaceService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}