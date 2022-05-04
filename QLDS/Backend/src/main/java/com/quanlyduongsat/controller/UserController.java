package com.quanlyduongsat.controller;

import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.google.gson.Gson;
import com.quanlyduongsat.entity.User;
import com.quanlyduongsat.model.SearchCriteria;
import com.quanlyduongsat.model.SearchOperation;
import com.quanlyduongsat.repository.UserRepository;
import com.quanlyduongsat.spec.UserSpecification;

@RestController
@CrossOrigin
@RequestMapping(produces = MediaType.APPLICATION_JSON_VALUE)
public class UserController {

    @Autowired
    private Gson gson;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JavaMailSender emailSender;

    @GetMapping(value = "/user/list")
    public ResponseEntity<?> findUsers(@RequestParam(required=false, value="userID", defaultValue = "") String userID,
                                       @RequestParam(required=false, value="username", defaultValue = "") String username,
                                       @RequestParam(required=false, value="companyID", defaultValue = "") String companyID,
                                       @RequestParam(required=false, value="role", defaultValue = "") String role) {
        UserSpecification userSpecification = new UserSpecification();
        if (!userID.isEmpty()) {
            userSpecification.add(new SearchCriteria("userID", userID, SearchOperation.MATCH));
        }
        if (!username.isEmpty()) {
            userSpecification.add(new SearchCriteria("username", username, SearchOperation.MATCH));
        }
        if (!companyID.isEmpty()) {
            userSpecification.add(new SearchCriteria("companyID", companyID, SearchOperation.EQUAL));
        }
        if (!role.isEmpty()) {
            userSpecification.add(new SearchCriteria("role", role, SearchOperation.EQUAL));
        }
        return ResponseEntity.ok().body(gson.toJson(userRepository.findAll(userSpecification)));
    }

    @GetMapping(value = "/user")
    public ResponseEntity<?> getUserInfo(@RequestParam String userID) {
        Optional<User> userOptional = userRepository.findByUserID(userID);
        if (!userOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found!!!");
        }
        return ResponseEntity.ok().body(gson.toJson(userOptional.get()));
    }

    @PostMapping(value = "/user")
    public ResponseEntity<?> addUser(@RequestBody User user) {
        if (userRepository.existsByUserIDOrEmail(user.getUserID(), user.getEmail())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("User existed!!!");
        }

        String generatedPassword = UUID.randomUUID().toString().replace("-", "").substring(0, 9);

        // Create a Simple MailMessage.
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(user.getEmail());
        message.setSubject("Mật khẩu khởi tạo tại quanlyduongsat.com");
        message.setText("Mật khẩu khởi tạo của bạn (" + user.getUserID() + ") tại https://quanlyduongsat.com là: " + generatedPassword);
        emailSender.send(message);

        // Set data
        user.setPassword(passwordEncoder.encode(generatedPassword));
        user.setStatus("NA");
        return ResponseEntity.ok().body(gson.toJson(userRepository.save(user)));
    }

    @PutMapping(value = "/user")
    public ResponseEntity<?> updateUser(@RequestBody User updatedUser,
                                        @RequestParam(required=false, value="oldPassword", defaultValue = "") String oldPassword,
                                        @RequestParam(required=false, value="newPassword", defaultValue = "") String newPassword) {
        Optional<User> userOptional = userRepository.findByUserID(updatedUser.getUserID());
        if (!userOptional.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found!!!");
        }

        User user = userOptional.get();
        user.setUsername(updatedUser.getUsername());
        user.setSex(updatedUser.getSex());
        user.setDob(updatedUser.getDob());
        user.setPhoneNumber(updatedUser.getPhoneNumber());
        user.setAddress(updatedUser.getAddress());

        if (!oldPassword.isEmpty() && !newPassword.isEmpty() && passwordEncoder.matches(oldPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            if (Objects.equals(user.getStatus(), "NA")) {
                user.setStatus("A");
            }
        }

        return ResponseEntity.ok().body(userRepository.save(user));
    }
}
