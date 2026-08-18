import { useState } from "react";
import { ArrowLeft, Search, Check } from "lucide-react";
import { colorScheme } from "../../../theme/colorScheme";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import { useMessages } from "../../../../contexts/MessageProvider";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { addGroupMembers } from "../Api";
import styles from "../GroupInfoPanel.module.css";

interface Props {
  groupId: string;
  currentMembers: string[];
  onClose: () => void;
}

export default function AddGroupMemberPanel({
  groupId,
  currentMembers,
  onClose,
}: Props) {
  const { connections } = useConnectedPeople();
  const { updateGroupInfo } = useMessages();
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const memberIds = new Set(currentMembers);
  const candidates = Array.from(connections.values()).filter((c) => {
    if (memberIds.has(c._id)) return false; // already in the group
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;
    return (
      c.username.toLowerCase().includes(term) ||
      c.fullname.toLowerCase().includes(term)
    );
  });

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleAdd = async () => {
    if (selected.size === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const newIds = Array.from(selected);
      await addGroupMembers(groupId, newIds);
      updateGroupInfo(groupId, { members: [...currentMembers, ...newIds] });
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button
          onClick={onClose}
          className={styles.backButton}
          style={{ color: colorScheme.text }}
          aria-label="Back"
        >
          <ArrowLeft size={20} />
        </button>
        <p
          style={{ color: colorScheme.textSecondary }}
          className={styles.title}
        >
          Add Members
        </p>
      </div>

      <div
        className={styles.searchBar}
        style={{ borderColor: colorScheme.border }}
      >
        <Search size={16} color={colorScheme.textSecondary} />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search your friends..."
          style={{ color: colorScheme.text }}
          className={styles.searchInput}
        />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.list}>
        {candidates.length === 0 && (
          <p className={styles.emptyText}>
            {connections.size === 0
              ? "You have no friends to add yet"
              : "No matches"}
          </p>
        )}
        {candidates.map((person) => {
          const isSelected = selected.has(person._id);
          return (
            <div
              key={person._id}
              className={styles.memberRow}
              onClick={() => toggle(person._id)}
              style={{ cursor: "pointer" }}
            >
              <Avatar name={person.fullname || person.username} size={40} />
              <div className={styles.memberInfo}>
                <div
                  style={{ color: colorScheme.text }}
                  className={styles.memberName}
                >
                  {person.fullname}
                </div>
                <div
                  style={{ color: colorScheme.textSecondary }}
                  className={styles.memberUsername}
                >
                  @{person.username}
                </div>
              </div>
              <div
                className={styles.checkCircle}
                style={{
                  background: isSelected ? "#0a84ff" : "transparent",
                  border: isSelected
                    ? "none"
                    : `1px solid ${colorScheme.border}`,
                }}
              >
                {isSelected && <Check size={14} color="white" />}
              </div>
            </div>
          );
        })}
      </div>

      <button
        className={styles.createButton}
        disabled={selected.size === 0 || submitting}
        onClick={handleAdd}
      >
        {submitting ? "Adding..." : `Add ${selected.size || ""}`.trim()}
      </button>
    </div>
  );
}
