package com.matech.finanzas.service;

import com.matech.finanzas.dto.CategoriaDTO;
import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.mapper.CategoriaMapper;
import com.matech.finanzas.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final CategoriaMapper categoriaMapper;


    public CategoriaDTO crear(CategoriaDTO dto){
        Categoria categoria = categoriaMapper.toEntity(dto);
        return categoriaMapper.toDTO(categoriaRepository.save(categoria));
    }

    public List<CategoriaDTO> listar(){
        return categoriaRepository.findAll()
                .stream()
                .map(categoriaMapper::toDTO)
                .toList();
    }

}
