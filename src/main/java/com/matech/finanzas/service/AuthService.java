package com.matech.finanzas.service;

import com.matech.finanzas.dto.AuthResponse;
import com.matech.finanzas.dto.LoginRequest;
import com.matech.finanzas.dto.RegisterRequest;
import com.matech.finanzas.entity.Rol;
import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.exception.ValidationException;
import com.matech.finanzas.repository.UsuarioRepository;
import com.matech.finanzas.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final CategoriaService categoriaService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        log.info("Registrando nuevo usuario: {}", request.getEmail());

        // Verificar si el email ya existe
        if (usuarioRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new ValidationException("El email ya está registrado");
        }

        // Crear nuevo usuario
        var usuario = Usuario.builder()
                .nombre(request.getNombre())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(Rol.ROLE_USER)
                .activo(true)
                .build();

        usuario = usuarioRepository.save(usuario);
        log.info("Usuario creado con ID: {}", usuario.getId());

        // Crear categorías predeterminadas para el usuario
        try {
            categoriaService.crearCategoriasPredeterminadasParaUsuario(usuario);
            log.info("Categorías predeterminadas creadas para usuario: {}", usuario.getEmail());
        } catch (Exception e) {
            log.error("Error al crear categorías predeterminadas: {}", e.getMessage());
            // No falla el registro si hay error con categorías
        }

        // Generar token JWT
        var jwtToken = jwtService.generateToken(usuario);

        return AuthResponse.builder()
                .token(jwtToken)
                .type("Bearer")
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol().name())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Intentando login para: {}", request.getEmail());

        // Autenticar usuario
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Buscar usuario
        var usuario = usuarioRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ValidationException("Credenciales inválidas"));

        log.info("Login exitoso para: {}", request.getEmail());

        // Generar token JWT
        var jwtToken = jwtService.generateToken(usuario);

        return AuthResponse.builder()
                .token(jwtToken)
                .type("Bearer")
                .id(usuario.getId())
                .nombre(usuario.getNombre())
                .email(usuario.getEmail())
                .rol(usuario.getRol().name())
                .build();
    }
}