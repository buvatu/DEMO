package com.quanlyduongsat.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.quanlyduongsat.entity.AccountTitle;

@Repository
public interface AccountTitleRepository extends JpaRepository<AccountTitle, Long> {

    Optional<AccountTitle> findByAccountID(String accountID);

}
