import { useState } from "react";
import { ArrowLeft, Search, Check } from "lucide-react";
import { colorScheme } from "../../../theme/colorScheme";
import { useConnectedPeople } from "../../../../contexts/RelationProvider";
import { useMessages } from "../../../../contexts/MessageProvider";
import { useAuth } from "../../../../contexts/AuthProvider";
import { Avatar } from "../../../components/avatart_genrator/Avatar";
import { createGroup } from "../Api";
import styles from "../GroupInfoPanel.module.css";

interface Props {
  onClose: () => void;
  onCreated: (groupId: string) => void;
}

export default function CreateGroupPanel({ onClose, onCreated }: Props) {
  const { connections } = useConnectedPeople();
  const { hydrateConversations } = useMessages();
  const { user } = useAuth();

  const [groupName, setGroupName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentUserId = (user as any)?._id ?? (user as any)?.id;

  const candidates = Array.from(connections.values()).filter((c) => {
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

  const handleCreate = async () => {
    const name = groupName.trim();
    if (!name) {
      setError("Give the group a name first.");
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const memberIds = Array.from(selected);
      const newGroup = await createGroup(name, memberIds);

      // Seed the cache immediately so the new group shows up in the list
      // and opens right away, without waiting on a full refetch.
      hydrateConversations({
        [newGroup._id]: {
          type: "group",
          groupInfo: {
            id: newGroup._id,
            name: newGroup.name,
            members: [currentUserId, ...memberIds],
            admin: currentUserId,
          },
          messageList: [],
          lastUpdated: newGroup.updatedAt ?? new Date().toISOString(),
          unreadedCount: 0,
        },
      });

      onCreated(newGroup._id);
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
          New Group
        </p>
      </div>

      <input
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Group name"
        className={styles.nameInput}
        style={{ color: colorScheme.text, borderColor: colorScheme.border }}
      />

      <div
        className={styles.searchBar}
        style={{ borderColor: colorScheme.border }}
      >
        <Search size={16} color={colorScheme.textSecondary} />
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search your friends to add..."
          style={{ color: colorScheme.text }}
          className={styles.searchInput}
        />
      </div>

      {error && <p className={styles.errorText}>{error}</p>}

      <div className={styles.list}>
        {candidates.length === 0 && (
          <p className={styles.emptyText}>
            {connections.size === 0
              ? "try search user in freinds section once to fully load connected people with you "
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
        disabled={!groupName.trim() || submitting}
        onClick={handleCreate}
      >
        {submitting ? "Creating..." : "Create Group"}
      </button>
    </div>
  );
}
