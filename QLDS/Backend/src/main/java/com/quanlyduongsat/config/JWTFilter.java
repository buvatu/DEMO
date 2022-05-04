package com.quanlyduongsat.config;

import java.io.IOException;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quanlyduongsat.entity.User;
import com.quanlyduongsat.repository.UserRepository;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;

public class JWTFilter extends OncePerRequestFilter {

    private static final String[] excludedURLs = new String[] {"/login**", "/token**", "/signout**" };

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private List<User> userList;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String errorMessage = getErrorMessage(request);
        if (!errorMessage.isEmpty()) {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);

            final Map<String, Object> body = new HashMap<>();
            body.put("status", HttpServletResponse.SC_UNAUTHORIZED);
            body.put("error", "Unauthorized");
            body.put("message", errorMessage);

            final ObjectMapper mapper = new ObjectMapper();
            mapper.writeValue(response.getOutputStream(), body);
            return;
        }

        // Next filter
        filterChain.doFilter(request, response);
    }

    private String getErrorMessage(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken == null || bearerToken.isEmpty()) {
            return "Missing token!!!";
        }
        if (!bearerToken.startsWith("Bearer ")) {
            return "Invalid token type!!!";
        }
        final String token = bearerToken.substring("Bearer ".length());
        Claims claims = null;
        try {
            claims = Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token).getBody(); // In case the token is expired
        } catch (Exception error) {
            return "Token expried!!!";
        }

        String userID = claims.getSubject();
        Optional<User> userOptional = userList.stream().filter(e -> userID.equals(e.getUserID())).findFirst();
        if (!userOptional.isPresent()) {
            userOptional = userRepository.findByUserID(userID);
            if (!userOptional.isPresent()) {
                return "User not found!!!";
            }
        }
        User user = userOptional.get();
        if (!token.equals(userOptional.get().getToken())) {
            return "Token not match!!!";
        }

        userList.removeIf(e -> userID.equals(e.getUserID()));
        userList.add(user);

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userID, null, Collections.singletonList(new SimpleGrantedAuthority(user.getRole())));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        return "";
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        AntPathMatcher pathMatcher = new AntPathMatcher();
        return Arrays.asList(excludedURLs).stream().anyMatch(p -> pathMatcher.match(p, request.getServletPath()));
    }

}