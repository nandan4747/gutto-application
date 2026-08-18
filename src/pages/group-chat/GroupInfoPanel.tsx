import { useState } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import { useMessages } from "../../../contexts/MessageProvider";
import { useAuth } from "../../../contexts/AuthProvider";
import { useConversation } from "../../../contexts/ConversationContext";
import { Avatar } from "../../components/avatart_genrator/Avatar";
import { colorScheme } from "../../theme/colorScheme";
import { removeGroupMember, deleteGroup, leaveGroup } from "./Api";
import GroupMemberRow from "./components/GroupMemberRow";
import AddGroupMemberPanel from "./components/AddGroupMemberPanel";
import styles from "./GroupInfoPanel.module.css";

export default function GroupInfoPanel() {
  const { state, updateGroupInfo, removeConversation } = useMessages();
  const { user } = useAuth();
  const {
    selectedConversationId,
    setSelectedConversationId,
    setShowGroupInfo,
  } = useConversation();

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const currentUserId = (user as any)?._id ?? (user as any)?.id;
  const groupId = selectedConversationId;
  const entry = groupId ? state[groupId] : undefined;
  const groupInfo = entry?.groupInfo;

  if (!groupId || !groupInfo) {
    return <div className={styles.emptyText}>Group not found</div>;
  }

  const isAdmin = groupInfo.admin === currentUserId;

  if (isAddingMember) {
    return (
      <AddGroupMemberPanel
        groupId={groupId}
        currentMembers={groupInfo.members}
        onClose={() => setIsAddingMember(false)}
      />
    );
  }

  const handleRemoveMember = async (targetId: string) => {
    setRemovingId(targetId);
    setError(null);
    try {
      await removeGroupMember(groupId, targetId);
      updateGroupInfo(groupId, {
        members: groupInfo.members.filter((id) => id !== targetId),
      });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRemovingId(null);
    }
  };

  const handleDeleteGroup = async () => {
    setDeleting(true);
    setError(null);
    try {
      await deleteGroup(groupId);
      removeConversation(groupId);
      setShowGroupInfo(false);
      setSelectedConversationId(null);
    } catch (err: any) {
      setError(err.message);
      setDeleting(false);
    }
  };

  // Same exit path as delete — the group disappears from this user's
  // conversation list either way, the difference is just which endpoint
  // fires and who else is affected server-side.
  const handleLeaveGroup = async () => {
    setLeaving(true);
    setError(null);
    try {
      await leaveGroup(groupId);
      removeConversation(groupId);
      setShowGroupInfo(false);
      setSelectedConversationId(null);
    } catch (err: any) {
      setError(err.message);
      setLeaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          className={styles.backButton}
          style={{ color: colorScheme.text }}
          onClick={() => setShowGroupInfo(false)}
          aria-label="Back to chat"
        >
          <ArrowLeft size={20} />
        </button>
        <p
          style={{ color: colorScheme.textSecondary }}
          className={styles.title}
        >
          Group Info
        </p>
      </div>

      <div className={styles.profileSection}>
        <Avatar name={groupInfo.name} size={80} />
        <div style={{ color: colorScheme.text }} className={styles.groupName}>
          {groupInfo.name}
        </div>
        <div
          style={{ color: colorScheme.textSecondary }}
          className={styles.memberCount}
        >
          {groupInfo.members.length} member
          {groupInfo.members.length === 1 ? "" : "s"}
        </div>
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.sectionHeader}>
        <span
          style={{ color: colorScheme.textSecondary }}
          className={styles.sectionTitle}
        >
          Members
        </span>
        {isAdmin && (
          <button
            className={styles.addMemberButton}
            onClick={() => setIsAddingMember(true)}
          >
            <UserPlus size={14} />
            Add
          </button>
        )}
      </div>

      <div className={styles.list}>
        {groupInfo.members.map((memberId) => (
          <GroupMemberRow
            key={memberId}
            userId={memberId}
            isAdmin={memberId === groupInfo.admin}
            canRemove={
              isAdmin && memberId !== groupInfo.admin && removingId !== memberId
            }
            onRemove={() => handleRemoveMember(memberId)}
          />
        ))}
      </div>

      {/* Admin gets "delete for everyone"; everyone else gets "leave".
          An admin isn't offered "leave" here — leaving would orphan the
          group's admin slot, and there's no transfer-ownership flow yet,
          so admins go through delete instead. */}
      {isAdmin ? (
        <div className={styles.dangerZone}>
          {confirmingDelete ? (
            <div className={styles.confirmRow}>
              <span
                style={{ color: colorScheme.textSecondary }}
                className={styles.confirmText}
              >
                Delete this group for everyone?
              </span>
              <button
                className={styles.confirmYesDanger}
                disabled={deleting}
                onClick={handleDeleteGroup}
              >
                Yes
              </button>
              <button
                className={styles.confirmNo}
                style={{
                  color: colorScheme.text,
                  borderColor: colorScheme.border,
                }}
                disabled={deleting}
                onClick={() => setConfirmingDelete(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className={styles.deleteButton}
              onClick={() => setConfirmingDelete(true)}
            >
              Delete Group
            </button>
          )}
        </div>
      ) : (
        <div className={styles.dangerZone}>
          {confirmingLeave ? (
            <div className={styles.confirmRow}>
              <span
                style={{ color: colorScheme.textSecondary }}
                className={styles.confirmText}
              >
                Leave this group?
              </span>
              <button
                className={styles.confirmYesDanger}
                disabled={leaving}
                onClick={handleLeaveGroup}
              >
                Yes
              </button>
              <button
                className={styles.confirmNo}
                style={{
                  color: colorScheme.text,
                  borderColor: colorScheme.border,
                }}
                disabled={leaving}
                onClick={() => setConfirmingLeave(false)}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className={styles.deleteButton}
              onClick={() => setConfirmingLeave(true)}
            >
              Leave Group
            </button>
          )}
        </div>
      )}
    </div>
  );
}
