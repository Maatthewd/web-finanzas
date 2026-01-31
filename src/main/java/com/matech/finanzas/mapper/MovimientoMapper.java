package com.matech.finanzas.mapper;

import com.matech.finanzas.dto.MovimientoDTO;
import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.entity.Movimiento;
import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.entity.Workspace;
import com.matech.finanzas.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MovimientoMapper {
    private final CategoriaRepository categoriaRepository;

    public MovimientoDTO toDTO(Movimiento mov) {
        if (mov == null) {
            return null;
        }

        return MovimientoDTO.builder()
                .id(mov.getId())
                .tipo(mov.getTipo())
                .descripcion(mov.getDescripcion())
                .monto(mov.getMonto())
                .fecha(mov.getFecha())
                .fechaVencimiento(mov.getFechaVencimiento())
                .pagado(mov.isPagado())
                .categoriaId(mov.getCategoria().getId())
                .categoriaNombre(mov.getCategoria().getNombre())
                .workspaceId(mov.getWorkspace() != null ? mov.getWorkspace().getId() : null)
                .workspaceNombre(mov.getWorkspace() != null ? mov.getWorkspace().getNombre() : null)
                .build();
    }

    public Movimiento toEntity(MovimientoDTO dto, Categoria categoria,
                               Usuario usuario, Workspace workspace) {
        if (dto == null) {
            return null;
        }

        return Movimiento.builder()
                .id(dto.getId())
                .tipo(dto.getTipo())
                .descripcion(dto.getDescripcion())
                .monto(dto.getMonto())
                .fecha(dto.getFecha())
                .fechaVencimiento(dto.getFechaVencimiento())
                .pagado(dto.isPagado())
                .categoria(categoria)
                .usuario(usuario)
                .workspace(workspace)
                .build();
    }
}