package com.matech.finanzas.service;

import com.matech.finanzas.dto.ResumenDashboardDTO;
import com.matech.finanzas.entity.Workspace;
import com.matech.finanzas.exception.ResourceNotFoundException;
import com.matech.finanzas.exception.ValidationException;
import com.matech.finanzas.repository.MovimientoRepository;
import com.matech.finanzas.repository.WorkspaceRepository;
import com.matech.finanzas.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final MovimientoRepository movimientoRepository;
    private final WorkspaceRepository workspaceRepository;

    public ResumenDashboardDTO obtenerResumenDashboard(Long workspaceId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();

        // Verificar workspace si se especifica
        if (workspaceId != null) {
            Workspace workspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

            if (!workspace.getUsuario().getId().equals(usuarioId)) {
                throw new ValidationException("El workspace no pertenece al usuario");
            }
        }

        return ResumenDashboardDTO.builder()
                .ingresos(movimientoRepository.totalIngresosPagados(usuarioId, workspaceId))
                .egresos(movimientoRepository.totalEgresosPagados(usuarioId, workspaceId))
                .balance(movimientoRepository.totalIngresosPagados(usuarioId, workspaceId)
                        .subtract(movimientoRepository.totalEgresosPagados(usuarioId, workspaceId)))
                .deudas(movimientoRepository.totalDeudasPendientes(usuarioId, workspaceId))
                .categorias(movimientoRepository.totalPorCategoria(usuarioId, workspaceId))
                .build();
    }
}