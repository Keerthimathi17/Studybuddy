package com.example.buddy.controller;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.buddy.model.Membership;
import com.example.buddy.service.MembershipService;

@RestController
@RequestMapping("/api/memberships")
public class MembershipController {

    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    @PostMapping("/join")
    public Membership joinGroup(
            @RequestParam Long groupId,
            @RequestParam Long studentId) {

        return membershipService.joinGroup(groupId, studentId);
    }

    @DeleteMapping("/leave")
    public String leaveGroup(
            @RequestParam Long groupId,
            @RequestParam Long studentId) {

        return membershipService.leaveGroup(groupId, studentId);
    }

    @GetMapping("/count/{groupId}")
    public int getMemberCount(@PathVariable Long groupId) {

        return membershipService.getMemberCount(groupId);
    }

    @DeleteMapping("/remove")
    public String removeMember(
            @RequestParam Long groupId,
            @RequestParam Long studentId,
            @RequestParam Long creatorId) {

        return membershipService.removeMember(
                groupId,
                studentId,
                creatorId);
    }
}