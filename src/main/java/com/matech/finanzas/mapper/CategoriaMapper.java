package com.matech.finanzas.mapper;

import com.matech.finanzas.dto.CategoriaDTO;
import com.matech.finanzas.entity.Categoria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CategoriaMapper {

    public CategoriaDTO toDTO(Categoria categoria) {
        return CategoriaDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .tipo(categoria.getTipo())
                .build();
    }

    public Categoria toEntity(CategoriaDTO categoriaDTO) {
        return Categoria.builder()
                .id(categoriaDTO.getId())
                .nombre(categoriaDTO.getNombre())
                .tipo(categoriaDTO.getTipo())
                .build();
    }
}
