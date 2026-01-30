package com.matech.finanzas.dto;

import com.matech.finanzas.entity.TipoCategoria;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoriaDTO {
    private Long id;
    private String nombre;
    private TipoCategoria tipo;
}
