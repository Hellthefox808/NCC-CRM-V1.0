import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { ChatService } from "../services/messaging/chat.service.ts";

describe("NCC CRM Communication Hub & Cadre Collaboration Test Suite", () => {
  const officerUser = {
    id: "officer_ano",
    name: "Capt. Dr. Animesh Roy (ANO)",
    role: "ADMIN",
  };

  const cadetUser1 = {
    id: "cadet_suo_aman",
    name: "SUO Aman Kumar",
    role: "CADET",
  };

  const cadetUser2 = {
    id: "cadet_juo_priya",
    name: "JUO Priya Singh",
    role: "CADET",
  };

  it("1. Initializes battalion channels and lists conversations accessible to officer", async () => {
    const convs = await ChatService.listConversations(officerUser.id);
    assert.ok(Array.isArray(convs));
    assert.ok(convs.length >= 2, "Should include seeded battalion announcements and sub-unit hub");

    const announcementChannel = convs.find(
      (c) => c.id === "conv_official_announcements" || c.type === "channel",
    );
    assert.ok(announcementChannel, "Official announcements channel exists");
    assert.equal(announcementChannel?.type, "channel");
    assert.equal(announcementChannel?.isOfficial, true);
  });

  it("2. Direct messaging canonical pair guarantee (prevents duplicate 1-to-1 rooms)", async () => {
    const conv1 = await ChatService.createDirectConversation(cadetUser1, cadetUser2);

    assert.ok(conv1.id);
    assert.equal(conv1.type, "direct");
    assert.equal(conv1.memberCount, 2);

    // Attempt to create duplicate with reversed order of participants
    const conv2 = await ChatService.createDirectConversation(cadetUser2, cadetUser1);

    assert.equal(
      conv1.id,
      conv2.id,
      "Direct chat creation between the same pair must resolve to the canonical conversation",
    );
  });

  it("3. Group creation with custom title, membership roles and initial system event", async () => {
    const group = await ChatService.createGroupConversation(officerUser, {
      title: "Ranchi Republic Day Camp (RDC) Contingent 2026",
      description: "Coordination channel for selected drill & cultural cadets",
      groupType: "camp",
      memberIds: [cadetUser1.id, cadetUser2.id],
    });

    assert.ok(group.id.startsWith("conv_grp_"));
    assert.equal(group.title, "Ranchi Republic Day Camp (RDC) Contingent 2026");
    assert.equal(group.type, "group");
    assert.equal(group.groupType, "camp");

    // Fetch conversation details with member array
    const details = await ChatService.getConversation(group.id, officerUser.id);
    assert.ok(details.members.length >= 3);

    const officerMember = details.members.find((m) => m.userId === officerUser.id);
    assert.equal(officerMember?.memberRole, "creator");

    // Check system event message was auto-persisted
    const history = await ChatService.listMessages(group.id, officerUser.id);
    assert.ok(history.length >= 1);
    const systemMsg = history.find((m) => m.messageType === "system");
    assert.ok(systemMsg, "Initial system announcement was created");
    assert.match(systemMsg!.content, /created.*group/i);
  });

  it("4. Message sending with threading/reply context and CRM context cards", async () => {
    // 1. Create a dedicated coordination group for test isolation
    const coordGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Alpha Platoon Drill Squad",
      groupType: "training",
      memberIds: [cadetUser1.id],
    });

    // 2. Officer sends root message with CRM card
    const rootMsg = await ChatService.sendMessage(coordGroup.id, officerUser, {
      content: "All SD cadets report for 06:00 AM Physical Fitness Drill tomorrow.",
      crmCard: {
        type: "training",
        title: "Morning Parade & 1600m Run Time Trial",
        subtitle: "Purulia Road Ground",
        date: "Tomorrow 06:00 AM",
        status: "Mandatory",
      },
    });

    assert.ok(rootMsg.id);
    assert.equal(rootMsg.senderId, officerUser.id);
    assert.equal(rootMsg.crmCard?.type, "training");

    // 3. Cadet replies to root message
    const replyMsg = await ChatService.sendMessage(coordGroup.id, cadetUser1, {
      content: "Understood Jai Hind Sir, Platoon Alpha ready.",
      replyToId: rootMsg.id,
    });

    assert.ok(replyMsg.id);
    assert.equal(replyMsg.replyToId, rootMsg.id);
    assert.ok(replyMsg.replyToPreview);
    assert.match(replyMsg.replyToPreview!.content, /06:00 AM Physical Fitness Drill/);
  });

  it("5. Message editing enforcement (author only) and audit tracking", async () => {
    const editTestGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Notice Verification Channel",
      memberIds: [cadetUser1.id, cadetUser2.id],
    });

    const msg = await ChatService.sendMessage(editTestGroup.id, cadetUser1, {
      content: "Original notice with typos.",
    });

    // Author edits successfully
    const edited = await ChatService.editMessage(
      editTestGroup.id,
      msg.id,
      cadetUser1.id,
      "Corrected notice for all squad leaders.",
    );
    assert.ok(edited);
    assert.equal(edited.content, "Corrected notice for all squad leaders.");
    assert.equal(edited.isEdited, true);
    assert.ok(edited.editedAt);

    // Non-author attempt should fail
    await assert.rejects(
      async () => {
        await ChatService.editMessage(
          editTestGroup.id,
          msg.id,
          cadetUser2.id,
          "Malicious edit attempt",
        );
      },
      {
        message: "Unauthorized: You can only edit your own messages.",
      },
    );
  });

  it("6. Message soft-deletion with audit preservation and placeholder mask", async () => {
    const deleteTestGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Discipline Review Space",
      memberIds: [cadetUser2.id],
    });

    const msg = await ChatService.sendMessage(deleteTestGroup.id, cadetUser2, {
      content: "Accidental test broadcast to squad.",
    });

    const result = await ChatService.deleteMessage(
      deleteTestGroup.id,
      msg.id,
      cadetUser2.id,
      "CADET",
    );
    assert.equal(result.success, true);
    assert.equal(result.messageId, msg.id);

    // Verify history now masks the content
    const history = await ChatService.listMessages(deleteTestGroup.id, cadetUser2.id);
    const deletedMsg = history.find((m) => m.id === msg.id);
    assert.ok(deletedMsg);
    assert.equal(deletedMsg?.isDeleted, true);
    assert.equal(deletedMsg?.content, "This message was deleted");
  });

  it("7. Emoji reaction lifecycle: add, duplicate prevention, and toggle removal", async () => {
    const reactionGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Awards & Commendations",
      memberIds: [cadetUser1.id, cadetUser2.id],
    });

    const msg = await ChatService.sendMessage(reactionGroup.id, officerUser, {
      content: "Cadet Aman Kumar awarded Best Drill Cadet for the month.",
    });

    // Cadet 1 reacts with salute emoji 🫡
    const reactions1 = await ChatService.toggleReaction(reactionGroup.id, msg.id, cadetUser1, "🫡");
    assert.ok(reactions1);
    const saluteReaction = reactions1.find((r) => r.emoji === "🫡");
    assert.ok(saluteReaction);
    assert.equal(saluteReaction?.count, 1);
    assert.ok(saluteReaction?.users.some((u) => u.id === cadetUser1.id));

    // Cadet 2 also reacts with 🫡
    const reactions2 = await ChatService.toggleReaction(reactionGroup.id, msg.id, cadetUser2, "🫡");
    const saluteReaction2 = reactions2.find((r) => r.emoji === "🫡");
    assert.equal(saluteReaction2?.count, 2);

    // Cadet 1 toggles off 🫡
    const reactions3 = await ChatService.toggleReaction(reactionGroup.id, msg.id, cadetUser1, "🫡");
    const saluteReaction3 = reactions3.find((r) => r.emoji === "🫡");
    assert.equal(saluteReaction3?.count, 1);
    assert.ok(!saluteReaction3?.users.some((u) => u.id === cadetUser1.id));
  });

  it("8. Read state advancement and unread counter synchronization", async () => {
    const unreadGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Fall-In Alerts",
      memberIds: [cadetUser1.id],
    });

    // Send a message
    const newMsg = await ChatService.sendMessage(unreadGroup.id, officerUser, {
      content: "Unread count validation test message.",
    });

    // Mark as read for cadetUser1
    const marked = await ChatService.markAsRead(unreadGroup.id, cadetUser1.id, newMsg.id);
    assert.equal(marked.success, true);
    assert.equal(marked.lastReadMessageId, newMsg.id);

    const convs = await ChatService.listConversations(cadetUser1.id);
    const foundGroup = convs.find((c) => c.id === unreadGroup.id);
    assert.equal(foundGroup?.unreadCount, 0, "Unread count should be 0 after marking as read");
  });

  it("9. Scoped search prevents unauthorized conversation data leakage", async () => {
    // Create an isolated private room between Officer and Cadet 1
    const secretGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Classified Weapon Training Logistics",
      memberIds: [cadetUser1.id],
    });

    await ChatService.sendMessage(secretGroup.id, officerUser, {
      content: "Ammunition dispatch cipher code ALPHA-7789",
    });

    // Cadet 1 searches -> finds message
    const cadet1Results = await ChatService.searchMessages(cadetUser1.id, "ALPHA-7789");
    assert.equal(cadet1Results.length, 1);
    assert.equal(cadet1Results[0].conversationId, secretGroup.id);

    // Cadet 2 (not a member) searches -> MUST NOT return any results
    const cadet2Results = await ChatService.searchMessages(cadetUser2.id, "ALPHA-7789");
    assert.equal(
      cadet2Results.length,
      0,
      "Search results must be strictly restricted to member conversations without data leakage",
    );
  });

  it("10. Interactive Poll creation, multi-cadet voting, vote retraction, and result tallies", async () => {
    const pollGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Firing Range Weapon Preference Poll",
      memberIds: [cadetUser1.id, cadetUser2.id],
    });

    // 1. Officer creates a poll with 3 options
    const pollMsg = await ChatService.createPoll(pollGroup.id, officerUser, {
      question: "Which weapon simulator session would you prioritize for next week?",
      options: [".22 Deluxe Rifle Mark IV", "7.62mm SLR Simulator", "Obstacle Course Drill"],
      allowsMultiple: false,
    });

    assert.ok(pollMsg.id);
    assert.equal(pollMsg.messageType, "poll");
    assert.ok(pollMsg.poll);
    assert.equal(pollMsg.poll?.options.length, 3);
    assert.equal(pollMsg.poll?.totalVotes, 0);

    const opt1 = pollMsg.poll!.options[0];
    const opt2 = pollMsg.poll!.options[1];

    // 2. Cadet 1 votes for Option 1 (.22 Deluxe Rifle)
    const updatedPoll1 = await ChatService.votePoll(pollGroup.id, pollMsg.id, cadetUser1, opt1.id);
    assert.equal(updatedPoll1.totalVotes, 1);
    assert.equal(updatedPoll1.options[0].voteCount, 1);
    assert.ok(updatedPoll1.options[0].votes.some((v) => v.userId === cadetUser1.id));

    // 3. Cadet 2 votes for Option 2 (7.62mm SLR)
    const updatedPoll2 = await ChatService.votePoll(pollGroup.id, pollMsg.id, cadetUser2, opt2.id);
    assert.equal(updatedPoll2.totalVotes, 2);
    assert.equal(updatedPoll2.options[0].voteCount, 1);
    assert.equal(updatedPoll2.options[1].voteCount, 1);

    // 4. Cadet 1 switches vote to Option 2 (single choice mode removes from Option 1)
    const updatedPoll3 = await ChatService.votePoll(pollGroup.id, pollMsg.id, cadetUser1, opt2.id);
    assert.equal(updatedPoll3.totalVotes, 2);
    assert.equal(updatedPoll3.options[0].voteCount, 0, "Cadet 1 vote removed from option 1");
    assert.equal(updatedPoll3.options[1].voteCount, 2, "Option 2 now has 2 votes");

    // 5. Cadet 1 toggles off vote (retraction)
    const updatedPoll4 = await ChatService.votePoll(pollGroup.id, pollMsg.id, cadetUser1, opt2.id);
    assert.equal(updatedPoll4.totalVotes, 1);
    assert.equal(updatedPoll4.options[1].voteCount, 1);
  });

  it("11. Message pinning, unpinning, and privileged pinned message retrieval", async () => {
    const pinGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Parade Ground Fall-In Orders",
      memberIds: [cadetUser1.id, cadetUser2.id],
    });

    const msg1 = await ChatService.sendMessage(pinGroup.id, officerUser, {
      content: "Mandatory: Wear beret with NCC hackle and polished DMS boots.",
    });

    // 1. Officer pins message
    const pinned = await ChatService.pinMessage(pinGroup.id, msg1.id, officerUser, true);
    assert.equal(pinned.isPinned, true);
    assert.ok(pinned.pinnedAt);
    assert.equal(pinned.pinnedBy, officerUser.name);

    // 2. Cadet lists pinned messages -> finds the pinned order
    const pinnedList = await ChatService.listPinnedMessages(pinGroup.id, cadetUser1.id);
    assert.equal(pinnedList.length, 1);
    assert.equal(pinnedList[0].id, msg1.id);

    // 3. Cadet cannot pin in group (officer/admin only)
    await assert.rejects(
      async () => {
        await ChatService.pinMessage(pinGroup.id, msg1.id, cadetUser1, false);
      },
      {
        message: "Unauthorized: Only group administrators or officers can pin messages.",
      },
    );

    // 4. Officer unpins message
    const unpinned = await ChatService.pinMessage(pinGroup.id, msg1.id, officerUser, false);
    assert.equal(unpinned.isPinned, false);

    const emptyPinnedList = await ChatService.listPinnedMessages(pinGroup.id, cadetUser1.id);
    assert.equal(emptyPinnedList.length, 0);
  });

  it("12. Group participant administration: add cadet, role modification, and member removal", async () => {
    const adminGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Purulia Road Quartermaster Squad",
      memberIds: [cadetUser1.id],
    });

    // 1. Officer adds Cadet 2 as member
    const newMember = await ChatService.addGroupMember(
      adminGroup.id,
      { id: officerUser.id, role: officerUser.role },
      { id: cadetUser2.id, name: cadetUser2.name, role: cadetUser2.role },
    );
    assert.ok(newMember.id);
    assert.equal(newMember.userId, cadetUser2.id);
    assert.equal(newMember.memberRole, "member");

    // Verify conversation memberCount incremented
    const convDetails = await ChatService.getConversation(adminGroup.id, officerUser.id);
    assert.equal(convDetails.conversation.memberCount, 3);

    // 2. Officer promotes Cadet 2 to moderator/admin
    const promoted = await ChatService.updateMemberRole(
      adminGroup.id,
      { id: officerUser.id, role: officerUser.role },
      cadetUser2.id,
      "admin",
    );
    assert.equal(promoted.memberRole, "admin");

    // 3. Cadet 2 leaves the group
    const leaveRes = await ChatService.removeGroupMember(
      adminGroup.id,
      { id: cadetUser2.id, role: cadetUser2.role },
      cadetUser2.id,
    );
    assert.equal(leaveRes.success, true);
    assert.equal(leaveRes.removedUserId, cadetUser2.id);

    // Verify conversation now has 2 members
    const finalDetails = await ChatService.getConversation(adminGroup.id, officerUser.id);
    assert.equal(finalDetails.conversation.memberCount, 2);
  });

  it("13. Message-to-Task Conversion: seamlessly transforming chat into CRM follow-up task", async () => {
    const taskGroup = await ChatService.createGroupConversation(officerUser, {
      title: "Ammunition & Inventory Check",
      memberIds: [cadetUser1.id],
    });

    const msg = await ChatService.sendMessage(taskGroup.id, officerUser, {
      content: "Verify all 50 drill rifles in Kote room by 17:00 hrs.",
    });

    const conversion = await ChatService.convertMessageToTask(taskGroup.id, msg.id, officerUser, {
      title: "Kote Room 50-Rifle Physical Verification",
      assignedTo: cadetUser1.name,
      priority: "high",
    });

    assert.ok(conversion.taskId.startsWith("TASK_"));
    assert.equal(conversion.message.convertedTaskId, conversion.taskId);

    // System announcement message appended
    const history = await ChatService.listMessages(taskGroup.id, officerUser.id);
    const taskSysMsg = history.find((m) => m.content.includes("Follow-up Task"));
    assert.ok(taskSysMsg);
    assert.match(taskSysMsg!.content, /Kote Room 50-Rifle/);
  });
});
