package com.example.buddy.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.buddy.model.StudyGroup;
import com.example.buddy.repository.StudyGroupRepository;

@Service
public class StudyGroupService {

    private final StudyGroupRepository studyGroupRepository;

    public StudyGroupService(StudyGroupRepository studyGroupRepository) {
        this.studyGroupRepository = studyGroupRepository;
    }

    public StudyGroup createGroup(StudyGroup group) {

        if (group.getName() == null || group.getName().trim().isEmpty()) {
            throw new RuntimeException("Group name is required");
        }

        if (group.getSubject() == null || group.getSubject().trim().isEmpty()) {
            throw new RuntimeException("Subject is required");
        }

        if (group.getMaxMembers() <= 0) {
            throw new RuntimeException("Maximum members must be greater than 0");
        }

        return studyGroupRepository.save(group);
    }

    public List<StudyGroup> getAllGroups() {
        return studyGroupRepository.findAll();
    }

    public StudyGroup getGroupById(Long id) {
        return studyGroupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Study group not found"));
    }

    public List<StudyGroup> getGroupsBySubject(String subject) {
        return studyGroupRepository.findBySubjectIgnoreCase(subject);
    }

    public String deleteGroup(Long id) {

        StudyGroup group = getGroupById(id);

        studyGroupRepository.delete(group);

        return "Study group deleted successfully";
    }
}