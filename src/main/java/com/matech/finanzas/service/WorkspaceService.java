package com.matech.finanzas.service;

import com.matech.finanzas.dto.WorkspaceDTO;
import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.entity.Workspace;
import com.matech.finanzas.exception.ResourceNotFoundException;
import com.matech.finanzas.exception.ValidationException;
import com.matech.finanzas.mapper.WorkspaceMapper;
import com.matech.finanzas.repository.UsuarioRepository;
import com.matech.finanzas.repository.WorkspaceRepository;
import com.matech.finanzas.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final UsuarioRepository usuarioRepository;
    private final WorkspaceMapper workspaceMapper;

    @Transactional
    public WorkspaceDTO crear(WorkspaceDTO dto) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario", "id", usuarioId));

        // Verificar que no exista otro workspace con el mismo nombre
        if (workspaceRepository.findByUsuarioIdAndNombre(usuarioId, dto.getNombre()).isPresent()) {
            throw new ValidationException("Ya existe un workspace con ese nombre");
        }

        // Si es el primer workspace, hacerlo principal
        long count = workspaceRepository.countByUsuarioId(usuarioId);
        boolean esPrimero = count == 0;

        Workspace workspace = workspaceMapper.toEntity(dto);
        workspace.setUsuario(usuario);
        workspace.setEsPrincipal(esPrimero || dto.isEsPrincipal());
        workspace.setActivo(true);

        // Si se marca como principal, quitar el flag de otros workspaces
        if (workspace.isEsPrincipal()) {
            desmarcarOtrosPrincipales(usuarioId);
        }

        Workspace saved = workspaceRepository.save(workspace);
        log.info("Workspace creado: {} para usuario: {}", saved.getNombre(), usuario.getEmail());

        return workspaceMapper.toDTO(saved);
    }

    public List<WorkspaceDTO> listar() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return workspaceRepository.findByUsuarioIdOrderByEsPrincipalDescNombreAsc(usuarioId)
                .stream()
                .map(workspaceMapper::toDTO)
                .collect(Collectors.toList());
    }

    public List<WorkspaceDTO> listarActivos() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        return workspaceRepository.findByUsuarioIdAndActivoTrue(usuarioId)
                .stream()
                .map(workspaceMapper::toDTO)
                .collect(Collectors.toList());
    }

    public WorkspaceDTO obtenerPorId(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));

        if (!workspace.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para ver este workspace");
        }

        return workspaceMapper.toDTO(workspace);
    }

    public WorkspaceDTO obtenerPrincipal() {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Workspace workspace = workspaceRepository.findByUsuarioIdAndEsPrincipalTrue(usuarioId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró un workspace principal"));

        return workspaceMapper.toDTO(workspace);
    }

    @Transactional
    public WorkspaceDTO actualizar(Long id, WorkspaceDTO dto) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Workspace existente = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));

        if (!existente.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para actualizar este workspace");
        }

        // Verificar nombre duplicado (excepto el actual)
        workspaceRepository.findByUsuarioIdAndNombre(usuarioId, dto.getNombre())
                .ifPresent(w -> {
                    if (!w.getId().equals(id)) {
                        throw new ValidationException("Ya existe un workspace con ese nombre");
                    }
                });

        existente.setNombre(dto.getNombre());
        existente.setDescripcion(dto.getDescripcion());
        existente.setColor(dto.getColor());
        existente.setIcono(dto.getIcono());
        existente.setActivo(dto.isActivo());

        // Si se marca como principal, desmarcar otros
        if (dto.isEsPrincipal() && !existente.isEsPrincipal()) {
            desmarcarOtrosPrincipales(usuarioId);
            existente.setEsPrincipal(true);
        }

        Workspace actualizado = workspaceRepository.save(existente);
        return workspaceMapper.toDTO(actualizado);
    }

    @Transactional
    public void eliminar(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));

        if (!workspace.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para eliminar este workspace");
        }

        if (workspace.isEsPrincipal()) {
            throw new ValidationException("No puedes eliminar el workspace principal");
        }

        workspaceRepository.deleteById(id);
    }

    @Transactional
    public void establecerComoPrincipal(Long id) {
        Long usuarioId = SecurityUtils.getCurrentUserId();
        Workspace workspace = workspaceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", "id", id));

        if (!workspace.getUsuario().getId().equals(usuarioId)) {
            throw new ValidationException("No tienes permiso para modificar este workspace");
        }

        desmarcarOtrosPrincipales(usuarioId);
        workspace.setEsPrincipal(true);
        workspaceRepository.save(workspace);
    }

    private void desmarcarOtrosPrincipales(Long usuarioId) {
        workspaceRepository.findByUsuarioIdAndEsPrincipalTrue(usuarioId)
                .ifPresent(w -> {
                    w.setEsPrincipal(false);
                    workspaceRepository.save(w);
                });
    }

    /**
     * Crea workspaces predeterminados para un nuevo usuario
     */
    @Transactional
    public void crearWorkspacesPredeterminados(Usuario usuario) {
        log.info("Creando workspaces predeterminados para usuario: {}", usuario.getEmail());

        // Workspace principal - Personal
        Workspace personal = Workspace.builder()
                .nombre("Personal")
                .descripcion("Finanzas personales")
                .usuario(usuario)
                .esPrincipal(true)
                .activo(true)
                .color("#6366f1")
                .icono("🏠")
                .build();
        workspaceRepository.save(personal);

        log.info("Workspace predeterminado 'Personal' creado para usuario: {}", usuario.getEmail());
    }
}