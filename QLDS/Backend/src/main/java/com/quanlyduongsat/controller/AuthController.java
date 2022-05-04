package com.quanlyduongsat.controller;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.quanlyduongsat.entity.User;
import com.quanlyduongsat.repository.UserRepository;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@RestController
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private List<User> userList;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @PostMapping(value = "/login")
    public ResponseEntity<?> login(@RequestParam String userID, @RequestParam String password) {
        Optional<User> userOptional = userRepository.findByUserID(userID);
        if (!userOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Username not found!!!");
        }
        User user = userOptional.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Password not match!!!");
        }
        String token = Jwts.builder().setIssuer(user.getCompanyID())
                                     .setAudience(user.getRole())
                                     .setSubject(userID)
                                     .setIssuedAt(new Date())
                                     .setExpiration(new Date(System.currentTimeMillis() + 24 * 60 * 60 * 1000))
                                     .signWith(SignatureAlgorithm.HS512, jwtSecret)
                                     .compact();
        user.setToken(token);
        user = userRepository.save(user);
        userList.removeIf(e -> userID.equals(e.getUserID()));
        userList.add(user);
        return ResponseEntity.ok(user);
    }

    @GetMapping(value = "/token")
    public ResponseEntity<?> getToken(@RequestParam String token) {
        Optional<User> userOptional = userRepository.findByToken(token);
        if (!userOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token not found!!!");
        }
        User user = userOptional.get();
        try {
            Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(user.getToken()).getBody();
        } catch (Exception error) {
            user.setToken(null);
            userRepository.save(user);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Token invalid!!!");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping(value = "/signout")
    public ResponseEntity<?> signout(@RequestParam String userID, @RequestParam String token) {
        Optional<User> userOptional = userRepository.findByUserIDAndToken(userID, token);
        if (!userOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Username and Token not match!!!");
        }
        User user = userOptional.get();
        user.setToken(null);
        userRepository.save(user);
        return ResponseEntity.ok("ok");
    }
}
