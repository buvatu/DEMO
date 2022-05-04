package com.quanlyduongsat.repository;

import java.util.List;

import com.quanlyduongsat.entity.User;

public interface QLDSRepository {

    List<User> findUsersByConditions(String username, String fullname, String companyID, String role);

}
