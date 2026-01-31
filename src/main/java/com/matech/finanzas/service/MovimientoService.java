package com.matech.finanzas.service;

import com.matech.finanzas.dto.MovimientoDTO;
import com.matech.finanzas.entity.Categoria;
import com.matech.finanzas.entity.Movimiento;
import com.matech.finanzas.entity.TipoMovimiento;
import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.entity.Workspace;
import com.matech.finanzas.exception.ResourceNotFoundException;
import com.matech.finanzas.exception.ValidationException;
import com.matech.finanzas.mapper.MovimientoMapper;
import com.matech.finanzas.repository.CategoriaRepository;
import com.matech.finanzas.repository.MovimientoRepository;
import com.matech.finanzas.repository.UsuarioRepository;
import com.matech.finanzas.repository.WorkspaceRepository;
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
    private final WorkspaceRepository workspaceRepository;
    private final MovimientoMapper movimientoMapper;

    @Transactional
    public MovimientoDTO crear(MovimientoDTO dto) {
        validarMovimiento(dto);

        Long usuarioId = SecurityUtils.getCurrentUserId();

        Categoria categoria = categoriaRepository.findById(dto.getCategoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría", "id", dto.getCategoriaId()));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        Workspace workspace = workspaceRepository.findById(dto.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", dto.getWorkspaceId()));

        // Verificar que el workspace pertenezca al usuario
        if (!workspace.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("El workspace no pertenece al usuario");
        }

        Movimiento movimiento = movimientoMapper.toEntity(dto, categoria, usuario, workspace);
        Movimiento saved = movimientoRepository.save(movimiento);

        return movimientoMapper.toDTO(saved);
    }

    public Page<MovimientoDTO> listar(Long workspaceId, Pageable pageable) {
        Long usuarioId = SecurityUtils.getCurrentUserId();

        if (workspaceId != null) {
            // Verificar que el workspace pertenezca al usuario
            Workspace workspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

            if (!workspace.getUsuario().getId().equals(usuarioId)) {
                throw new ValidationException("El workspace no pertenece al usuario");
            }

            return movimientoRepository.findByUsuarioIdAndWorkspaceIdOrderByFechaDesc(
                    usuarioId, workspaceId, pageable)
                    .map(movimientoMapper::toDTO);
        } else {
            // Retornar todos los movimientos del usuario
            return movimientoRepository.findByUsuarioIdOrderByFechaDesc(usuarioId, pageable)
                    .map(movimientoMapper::toDTO);
        }
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
            LocalDate fin,
            Long workspaceId) {

        Long usuarioId = SecurityUtils.getCurrentUserId();

        // Si se especifica workspace, verificar permisos
        if (workspaceId != null) {
            Workspace workspace = workspaceRepository.findById(workspaceId)
                    .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", workspaceId));

            if (!workspace.getUsuario().getId().equals(usuarioId)) {
                throw new ValidationException("El workspace no pertenece al usuario");
            }
        }

        return movimientoRepository
                .filtrarMovimientos(tipo, pagado, categoriaId, inicio, fin, usuarioId, workspaceId)
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

        Workspace workspace = workspaceRepository.findById(dto.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", dto.getWorkspaceId()));

        // Verificar que el workspace pertenezca al usuario
        if (!workspace.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("El workspace no pertenece al usuario");
        }

        existente.setTipo(dto.getTipo());
        existente.setDescripcion(dto.getDescripcion());
        existente.setMonto(dto.getMonto());
        existente.setFecha(dto.getFecha());
        existente.setFechaVencimiento(dto.getFechaVencimiento());
        existente.setPagado(dto.isPagado());
        existente.setCategoria(categoria);
        existente.setWorkspace(workspace);

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