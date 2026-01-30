package com.matech.finanzas.service;

import com.matech.finanzas.dto.MovimientoDTO;
import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.entity.Movimiento;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.exception.ResourceNotFoundException;
import com.matech.finanzas.exception.ValidationException;
import com.matech.finanzas.mapper.MovimientoMapper;
import com.matech.finanzas.repository.CategoriaRepository;
import com.matech.finanzas.repository.MovimientoRepository;
import com.matech.finanzas.repository.UsuarioRepository;
import com.matech.finanzas.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MovimientoService {

    private final MovimientoRepository movimientoRepository;
    private final CategoriaRepository categoriaRepository;
    private final UsuarioRepository usuarioRepository;
    private final MovimientoMapper movimientoMapper;

    @Transactional
    public MovimientoDTO crear(MovimientoDTO dto) {
        validarMovimiento(dto);
        
        Long usuarioId = SecurityUtils.getCurrentUserId();
        
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", dto.getCategoriaId()));
        
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));
        
        Movimiento movimiento = movimientoMapper.toEntity(dto, categoria, usuario);
        Movimiento saved = movimientoRepository.save(movimiento);
        
        return movimientoMapper.toDTO(saved);
    }

    public Page<MovimientoDTO> listar(Pageable pageable) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return movimientoRepository.findByUsuarioId(usuarioId, pageable)
                .map(movimientoMapper::toDTO);
    }

    public MovimientoDTO obtenerPorId(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Movimiento movimiento = movimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento", "id", id));
        
        // Verificar que el movimiento pertenece al usuario
        if (!movimiento.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para ver este movimiento");
        }
        
        return movimientoMapper.toDTO(movimiento);
    }

    public List<MovimientoDTO> filtrar(
            TipoMovimiento tipo,
            Boolean pagado,
            Long categoriaId,
            LocalDate inicio,
            LocalDate fin) {
        
        Long usuarioId = SecurityUtils.getCurrentUserId();
        
        return movimientoRepository
                .filtrarMovimientos(tipo, pagado, categoriaId, inicio, fin, usuarioId)
                .stream()
                .map(movimientoMapper::toDTO)
                .toList();
    }

    @Transactional
    public MovimientoDTO actualizar(Long id, MovimientoDTO dto) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        
        Movimiento existente = movimientoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento", "id", id));
        
        // Verificar permisos
        if (!existente.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para actualizar este movimiento");
        }
        
        validarMovimiento(dto);
        
        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", dto.getCategoriaId()));
        
        existente.setTipo(dto.getTipo());
        existente.setDescripcion(dto.getDescripcion());
        existente.setMonto(dto.getMonto());
        existente.setFecha(dto.getFecha());
        existente.setFechaVencimiento(dto.getFechaVencimiento());
        existente.setPagado(dto.isPagado());
        existente.setCategoria(categoria);
        
        Movimiento actualizado = movimientoRepository.save(existente);
        return movimientoMapper.toDTO(actualizado);
    }

    @Transactional
    public void pagarMovimiento(Long id) {
        verificarPermiso(id);
        movimientoRepository.marcarComoPagado(id);
    }

    @Transactional
    public void marcarPendiente(Long id) {
        verificarPermiso(id);
        movimientoRepository.marcarComoPendiente(id);
    }

    @Transactional
    public void eliminar(Long id) {
        verificarPermiso(id);
        movimientoRepository.deleteById(id);
    }

    private void verificarPermiso(Long movimientoId) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Movimiento movimiento = movimientoRepository.findById(movimientoId)
                .orElseThrow(() -> new ResourceNotFoundException("Movimiento", "id", movimientoId));
        
        if (!movimiento.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para realizar esta acción");
        }
    }

    private void validarMovimiento(MovimientoDTO dto) {
        if (dto.getFechaVencimiento() != null && 
            dto.getFechaVencimiento().isBefore(dto.getFecha())) {
            throw new ValidationException(
                "La fecha de vencimiento no puede ser anterior a la fecha del movimiento"
            );
        }
        
        if (dto.getMonto().signum() <= 0) {
            throw new ValidationException("El monto debe ser mayor a 0");
        }
    }
}
