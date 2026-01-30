package com.matech.finanzas.mapper;

import com.matech.finanzas.dto.CategoriaDTO;
import com.matech.finanzas.dto.MovimientoDTO;
import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.entity.Movimiento;
import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class MovimientoMapper {
    private final CategoriaRepository categoriaRepository;


    public MovimientoDTO toDTO(Movimiento mov) {

        return MovimientoDTO.builder()
                .id(mov.getId())
                .tipo(mov.getTipo())
                .descripcion(mov.getDescripcion())
                .monto(mov.getMonto())
                .fecha(mov.getFecha())
                .fechaVencimiento(mov.getFechaVencimiento())
                .pagado(mov.isPagado())
                .categoriaId(mov.getCategoria().getId())
                .build();
    }

    public Movimiento toEntity(MovimientoDTO dto, Categoria categoria, Usuario usuario) {
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
                .build();
    }
}
