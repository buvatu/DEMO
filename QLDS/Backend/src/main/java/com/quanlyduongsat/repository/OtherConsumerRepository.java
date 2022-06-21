package com.quanlyduongsat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.OtherConsumer;

@Repository
public interface OtherConsumerRepository extends JpaRepository<OtherConsumer, Long> {

    Optional<OtherConsumer> findByConsumerID(String consumerID);

}
