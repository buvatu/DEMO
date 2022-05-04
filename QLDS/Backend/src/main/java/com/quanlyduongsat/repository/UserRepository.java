package com.quanlyduongsat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByUserID(String userID);

    Optional<User> findByToken(String token);

    Optional<User> findByUserIDAndToken(String userID, String token);

    Boolean existsByUserIDOrEmail(String userID, String email);

}
