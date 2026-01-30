package com.matech.finanzas.service;

import com.matech.finanzas.dto.CategoriaDTO;
import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.exception.ResourceNotFoundException;
import com.matech.finanzas.mapper.CategoriaMapper;
import com.matech.finanzas.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final CategoriaMapper categoriaMapper;

    @Transactional
    public CategoriaDTO crear(CategoriaDTO dto) {
        Categoria categoria = categoriaMapper.toEntity(dto);
        Categoria saved = categoriaRepository.save(categoria);
        return categoriaMapper.toDTO(saved);
    }

    public List<CategoriaDTO> listar() {
        return categoriaRepository.findAll()
                .stream()
                .map(categoriaMapper::toDTO)
                .toList();
    }

    public CategoriaDTO obtenerPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", id));
        return categoriaMapper.toDTO(categoria);
    }

    @Transactional
    public CategoriaDTO actualizar(Long id, CategoriaDTO dto) {
        Categoria existente = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", id));
        
        existente.setNombre(dto.getNombre());
        existente.setTipo(dto.getTipo());
        
        Categoria actualizada = categoriaRepository.save(existente);
        return categoriaMapper.toDTO(actualizada);
    }

    @Transactional
    public void eliminar(Long id) {
        if (!categoriaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Categoría", "id", id);
        }
        categoriaRepository.deleteById(id);
    }
}
