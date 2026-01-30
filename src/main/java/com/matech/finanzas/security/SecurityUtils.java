package com.matech.finanzas.security;

import com.matech.finanzas.entity.Usuario;
import com.matech.finanzas.exception.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static Usuario getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthenticationException("No hay usuario autenticado");
        }
        
        Object principal = authentication.getPrincipal();
        
        if (principal instanceof Usuario) {
            return (Usuario) principal;
        }
        
        throw new AuthenticationException("Usuario no válido");
    }

    public static Long getCurrentUserId() {
        return getCurrentUser().getId();
    }
}
