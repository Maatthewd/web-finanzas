package com.matech.finanzas.mapper;

import com.matech.finanzas.dto.WorkspaceDTO;
import com.matech.finanzas.entity.Workspace;
import org.springframework.stereotype.Component;

@Component
public class WorkspaceMapper {

    public WorkspaceDTO toDTO(Workspace workspace) {
        if (workspace == null) {
            return null;
        }

        return WorkspaceDTO.builder()
                .id(workspace.getId())
                .nombre(workspace.getNombre())
                .descripcion(workspace.getDescripcion())
                .esPrincipal(workspace.isEsPrincipal())
                .activo(workspace.isActivo())
                .color(workspace.getColor())
                .icono(workspace.getIcono())
                .build();
    }

    public Workspace toEntity(WorkspaceDTO dto) {
        if (dto == null) {
            return null;
        }

        return Workspace.builder()
                .id(dto.getId())
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .esPrincipal(dto.isEsPrincipal())
                .activo(dto.isActivo())
                .color(dto.getColor() != null ? dto.getColor() : "#6366f1")
                .icono(dto.getIcono() != null ? dto.getIcono() : "🏠")
                .build();
    }
}