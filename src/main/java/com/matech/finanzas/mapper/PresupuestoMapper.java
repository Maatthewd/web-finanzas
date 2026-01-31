package com.matech.finanzas.mapper;

import com.matech.finanzas.dto.PresupuestoDTO;
import com.matech.finanzas.entity.Presupuesto;
import org.springframework.stereotype.Component;

@Component
public class PresupuestoMapper {

    public PresupuestoDTO toDTO(Presupuesto presupuesto) {
        if (presupuesto == null) {
            return null;
        }

        return PresupuestoDTO.builder()
                .id(presupuesto.getId())
                .nombre(presupuesto.getNombre())
                .montoLimite(presupuesto.getMontoLimite())
                .mes(presupuesto.getMes())
                .anio(presupuesto.getAnio())
                .categoriaId(presupuesto.getCategoria() != null ?
                        presupuesto.getCategoria().getId() : null)
                .alertaPorcentaje(presupuesto.getAlertaPorcentaje())
                .activo(presupuesto.isActivo())
                .build();
    }

    public Presupuesto toEntity(PresupuestoDTO dto) {
        if (dto == null) {
            return null;
        }

        return Presupuesto.builder()
                .id(dto.getId())
                .nombre(dto.getNombre())
                .montoLimite(dto.getMontoLimite())
                .mes(dto.getMes())
                .anio(dto.getAnio())
                .alertaPorcentaje(dto.getAlertaPorcentaje() != null ?
                        dto.getAlertaPorcentaje() : 80)
                .activo(dto.isActivo())
                .build();
    }
}