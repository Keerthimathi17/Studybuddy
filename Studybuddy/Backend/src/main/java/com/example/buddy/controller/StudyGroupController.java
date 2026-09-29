package com.example.buddy.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.buddy.model.StudyGroup;
import com.example.buddy.service.StudyGroupService;

@RestController
@RequestMapping("/api/groups")
public class StudyGroupController {

    private final StudyGroupService studyGroupService;

    public StudyGroupController(StudyGroupService studyGroupService) {
        this.studyGroupService = studyGroupService;
    }

    @PostMapping
    public StudyGroup createGroup(@RequestBody StudyGroup group) {
        return studyGroupService.createGroup(group);
    }

    @GetMapping
    public List<StudyGroup> getAllGroups() {
        return studyGroupService.getAllGroups();
    }

    @GetMapping("/{id}")
    public StudyGroup getGroup(@PathVariable Long id) {
        return studyGroupService.getGroupById(id);
    }

    @GetMapping("/subject/{subject}")
    public List<StudyGroup> getGroupsBySubject(
            @PathVariable String subject) {

        return studyGroupService.getGroupsBySubject(subject);
    }

    @DeleteMapping("/{id}")
    public String deleteGroup(@PathVariable Long id) {
        return studyGroupService.deleteGroup(id);
    }
}