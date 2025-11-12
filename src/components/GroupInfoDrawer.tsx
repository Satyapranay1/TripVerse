import { useState, useEffect } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { UserPlus, UserMinus, X, LogOut, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";

interface Member {
  id: string;
  name: string;
  email?: string;
}

interface Group {
  id: string;
  name: string;
  members: Member[];
}

interface GroupInfoDrawerProps {
  open: boolean;
  onClose: () => void;
  group: Group | null;
  isAdmin?: boolean;
}

const API_BASE = "https://travel-app1-p0m8.onrender.com/api";

const GroupInfoDrawer = ({
  open,
  onClose,
  group,
  isAdmin = true,
}: GroupInfoDrawerProps) => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const token = localStorage.getItem("token");

  /** ✅ Fetch group members */
  useEffect(() => {
    if (!group || !open) return;

    const fetchMembers = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `${API_BASE}/conversations/${group.id}/members`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // ✅ Normalize data to always include name/email at top level
        const normalizedMembers = res.data.members.map((m: any) => ({
          id: m.user?.id?.toString() || m.id?.toString(),
          name: m.user?.name || m.name || "Unknown",
          email: m.user?.email || m.email || "",
        }));

        setMembers(normalizedMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
        toast.error("Failed to load group members");
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [group, open]);

  /** ➕ Add members to group */
  const handleAddMembers = async () => {
    if (!group) return;
    setAdding(true);
    try {
      // ✅ Example: Use prompt temporarily (later replace with UI picker)
      const newMemberId = prompt("Enter user ID to add:");
      if (!newMemberId) return;

      await axios.post(
        `${API_BASE}/conversations/${group.id}/members`,
        { memberIds: [Number(newMemberId)] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Member added successfully!");
      setMembers((prev) => [
        ...prev,
        { id: newMemberId, name: `User ${newMemberId}` },
      ]);
    } catch (error) {
      console.error("Error adding member:", error);
      toast.error("Failed to add member");
    } finally {
      setAdding(false);
    }
  };

  /** ➖ Remove member from group */
  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!group) return;
    try {
      await axios.delete(
        `${API_BASE}/conversations/${group.id}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`${memberName} removed from group`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    } catch (error) {
      console.error("Error removing member:", error);
      toast.error("Failed to remove member");
    }
  };

  /** 🚪 Leave group (remove yourself) */
  const handleLeaveGroup = async () => {
    if (!group) return;
    try {
      const me = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const myId = me.data.id;

      await axios.delete(
        `${API_BASE}/conversations/${group.id}/members/${myId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("You left the group");
      onClose();
    } catch (error) {
      console.error("Error leaving group:", error);
      toast.error("Failed to leave group");
    }
  };

  /** ❌ Delete group (optional) */
  const handleDeleteGroup = async () => {
    if (!group) return;
    try {
      await axios.delete(`${API_BASE}/conversations/${group.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Group deleted successfully");
      onClose();
    } catch (error) {
      console.error("Error deleting group:", error);
      toast.error("Failed to delete group");
    }
  };

  if (!group) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-[600px] sm:w-[640px] p-0 bg-background border-l flex h-full shadow-xl"
      >
        {/* CLOSE BUTTON */}
        <div className="absolute top-4 right-4 z-10">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 p-8 overflow-y-auto space-y-8">
          {/* HEADER */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="w-28 h-28 shadow-lg">
              <AvatarFallback className="text-3xl bg-gradient-primary text-primary-foreground">
                {group.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-semibold">{group.name}</h2>
          </div>

          {/* MEMBERS */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                Members ({members.length})
              </h3>

              {isAdmin && (
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleAddMembers}
                  disabled={adding}
                >
                  {adding ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  Add Member
                </Button>
              )}
            </div>

            {loading ? (
              <div className="text-center text-muted-foreground py-6 text-sm">
                <Loader2 className="w-4 h-4 animate-spin inline-block mr-2" />
                Loading members...
              </div>
            ) : (
              <div className="space-y-3">
                {members.map((member) => {
                  const displayName = member?.name || "Unknown";
                  const email = member?.email || "";
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/25 hover:bg-muted/40 transition border border-muted/30"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>
                            {displayName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-[15px]">
                            {displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {email}
                          </p>
                        </div>
                      </div>

                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleRemoveMember(member.id, displayName)
                          }
                        >
                          <UserMinus className="w-5 h-5 text-destructive" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="space-y-2 pt-6 border-t">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={handleLeaveGroup}
            >
              <LogOut className="w-4 h-4" /> Leave Group
            </Button>

            {isAdmin && (
              <Button
                variant="destructive"
                className="w-full justify-start gap-2"
                onClick={handleDeleteGroup}
              >
                <Trash2 className="w-4 h-4" /> Delete Group
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GroupInfoDrawer;
