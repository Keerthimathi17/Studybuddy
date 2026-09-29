package com.example.buddy.service;

import org.springframework.stereotype.Service;

import com.example.buddy.model.Membership;
import com.example.buddy.model.StudyGroup;
import com.example.buddy.repository.MembershipRepository;
import com.example.buddy.repository.StudyGroupRepository;

@Service
public class MembershipService {

    private final MembershipRepository membershipRepository;
    private final StudyGroupRepository studyGroupRepository;

    public MembershipService(
            MembershipRepository membershipRepository,
            StudyGroupRepository studyGroupRepository) {

        this.membershipRepository = membershipRepository;
        this.studyGroupRepository = studyGroupRepository;
    }

    public Membership joinGroup(Long groupId, Long studentId) {

        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() ->
                        new RuntimeException("Study group not found"));

        if (studentId == null) {
            throw new RuntimeException("Student ID is required");
        }

        Membership existing =
                membershipRepository.findByGroupIdAndStudentId(
                        groupId, studentId);

        if (existing != null) {
            throw new RuntimeException(
                    "Student has already joined this group");
        }

        int currentMembers =
                membershipRepository.findByGroupId(groupId).size();

        if (currentMembers >= group.getMaxMembers()) {
            throw new RuntimeException(
                    "Study group is already full");
        }

        Membership membership = new Membership();

        membership.setGroupId(groupId);
        membership.setStudentId(studentId);

        return membershipRepository.save(membership);
    }

    public String leaveGroup(Long groupId, Long studentId) {

        Membership membership =
                membershipRepository.findByGroupIdAndStudentId(
                        groupId, studentId);

        if (membership == null) {
            throw new RuntimeException(
                    "Student is not a member of this group");
        }

        membershipRepository.delete(membership);

        return "Student left the group successfully";
    }

    public int getMemberCount(Long groupId) {

        if (!studyGroupRepository.existsById(groupId)) {
            throw new RuntimeException("Study group not found");
        }

        return membershipRepository.findByGroupId(groupId).size();
    }

    public String removeMember(
            Long groupId,
            Long studentId,
            Long creatorId) {

        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() ->
                        new RuntimeException("Study group not found"));

        if (group.getCreatorId() == null ||
                !group.getCreatorId().equals(creatorId)) {

            throw new RuntimeException(
                    "Only the group creator can remove a member");
        }

        Membership membership =
                membershipRepository.findByGroupIdAndStudentId(
                        groupId, studentId);

        if (membership == null) {
            throw new RuntimeException(
                    "Student is not a member of this group");
        }

        membershipRepository.delete(membership);

        return "Member removed successfully";
    }
}