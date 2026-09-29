package com.example.buddy.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.buddy.model.Membership;

public interface MembershipRepository
        extends JpaRepository<Membership, Long> {

    Membership findByGroupIdAndStudentId(
            Long groupId,
            Long studentId);

    List<Membership> findByGroupId(Long groupId);
}