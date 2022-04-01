package com.demo.auth.controller;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.demo.auth.model.User;
import com.demo.auth.repository.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@Validated
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    AuthenticationManager authenticationManager;

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    private static final String JWT_EXPIRATION_TIME = "JWT_EXPIRATION_TIME"; // configurable via environment variable, unit is minute
    private static final long DEFAULT_EXPIRE_TIME = 60 * 60 * 1000; // Default JWT expire time is 60 minutes

    @PostMapping("/signin")
    public ResponseEntity<?> login(@RequestParam @Valid @NotBlank String username, @RequestParam @Valid @NotBlank String password) {

        Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(username, password));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        Map<String, String> resultMap = new HashMap<String, String>();
        resultMap.put("accessToken", Jwts.builder().setSubject((username))
                                                   .setIssuedAt(new Date())
                                                   .setExpiration(getExpirationTime())
                                                   .signWith(SignatureAlgorithm.HS512, System.getenv("JWT_SHARED_SECRET"))
                                                   .compact());
        resultMap.put("tokenType", "Bearer");

        return ResponseEntity.ok(resultMap);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @NotBlank @Size(min = 3, max = 20) @RequestParam String username,
                                          @Valid @NotBlank @Size(max = 200) @RequestParam String fullname,
                                          @Valid @NotBlank @Size(min = 8, max = 40) @RequestParam String password,
                                          @Valid @NotBlank @Size(max = 50) @Email @RequestParam String email) {

        if (userRepository.existsByUsername(username)) {
            return ResponseEntity.badRequest().body("Error: Username is already taken!");
        }

        if (userRepository.existsByEmail(email)) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // Create new user's account
        userRepository.save(new User(username, fullname, email, encoder.encode(password), "USER"));

        return ResponseEntity.status(HttpStatus.CREATED).body("User registered successfully!");
    }

    private Date getExpirationTime() {
        long expireDuration = 0;
        if (System.getenv(JWT_EXPIRATION_TIME) == null || System.getenv(JWT_EXPIRATION_TIME).trim().isEmpty()) {
            expireDuration = DEFAULT_EXPIRE_TIME; // Default expire time is 60 minutes
        } else {
            try {
                expireDuration = Integer.parseInt(System.getenv(JWT_EXPIRATION_TIME)) * 60 * 1000;
            } catch (NumberFormatException e) {
                expireDuration = DEFAULT_EXPIRE_TIME; // Default expire time is 60 minutes
            }
        }
        return new Date(System.currentTimeMillis() + expireDuration);
    }
}
