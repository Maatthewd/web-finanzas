package com.matech.finanzas.controller;

import com.matech.finanzas.dto.CategoriaDTO;
import com.matech.finanzas.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @PostMapping
    public CategoriaDTO categoria(@RequestBody CategoriaDTO dto) {
        return categoriaService.crear(dto);
    }

    @GetMapping
    public List<CategoriaDTO> listar() {
        return categoriaService.listar();
    }
}
