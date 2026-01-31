package com.matech.finanzas.mapper;

import com.matech.finanzas.dto.CategoriaDTO;
import com.matech.finanzas.entity.Categoria;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class CategoriaMapper {

    public CategoriaDTO toDTO(Categoria categoria) {
        if (categoria == null) {
            return null;
        }

        return CategoriaDTO.builder()
                .id(categoria.getId())
                .nombre(categoria.getNombre())
                .tipo(categoria.getTipo())
                .categoriaPadreId(categoria.getCategoriaPadre() != null ?
                    categoria.getCategoriaPadre().getId() : null)
                .icono(categoria.getIcono())
                .color(categoria.getColor())
                .orden(categoria.getOrden())
                .esPredeterminada(categoria.isEsPredeterminada())
                .build();
    }

    public CategoriaDTO toDTOWithSubcategorias(Categoria categoria) {
        if (categoria == null) {
            return null;
        }

        CategoriaDTO dto = toDTO(categoria);

        if (categoria.getSubcategorias() != null && !categoria.getSubcategorias().isEmpty()) {
            dto.setSubcategorias(
                categoria.getSubcategorias().stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList())
            );
        }

        return dto;
    }

    public Categoria toEntity(CategoriaDTO categoriaDTO) {
        if (categoriaDTO == null) {
            return null;
        }

        return Categoria.builder()
                .id(categoriaDTO.getId())
                .nombre(categoriaDTO.getNombre())
                .tipo(categoriaDTO.getTipo())
                .icono(categoriaDTO.getIcono())
                .color(categoriaDTO.getColor())
                .orden(categoriaDTO.getOrden())
                .build();
    }
}