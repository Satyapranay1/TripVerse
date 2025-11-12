import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { toast } from "sonner";
import axios from "axios";

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreateGroup: (group: any) => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

const API_BASE = "https://travel-app1-p0m8.onrender.com/api";

const CreateGroupDialog = ({ open, onClose, onCreateGroup }: CreateGroupDialogProps) => {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [contacts, setContacts] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  /** ✅ Fetch all users for selection */
  useEffect(() => {
    if (!open || !token) return;

    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/auth/all`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setContacts(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast.error("Failed to load users.");
      }
    };

    fetchUsers();
  }, [open, token]);

  /** ✅ Create group by calling backend */
  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    if (selectedMembers.length === 0) {
      toast.error("Please select at least one member");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: groupName.trim(),
        memberIds: selectedMembers.map((id) => Number(id)),
      };

      const res = await axios.post(`${API_BASE}/conversations/group`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newGroup = res.data.group;

      // ✅ Notify parent (Community.tsx)
      onCreateGroup({
        id: newGroup.id.toString(),
        name: newGroup.name,
        isGroup: true,
        isFavorite: false,
        unread: 0,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        members: newGroup.members || [],
        messages: [],
      });

      toast.success("Group created successfully!");
      setGroupName("");
      setSelectedMembers([]);
      onClose();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Failed to create group. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Group</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="groupName">Group Name</Label>
            <Input
              id="groupName"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
            />
          </div>

          <div>
            <Label>Select Members</Label>
            <div className="mt-2 space-y-2 max-h-64 overflow-y-auto border rounded-md p-2">
              {contacts.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No users found
                </p>
              ) : (
                contacts.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary cursor-pointer"
                    onClick={() => {
                      if (selectedMembers.includes(user.id)) {
                        setSelectedMembers(selectedMembers.filter((id) => id !== user.id));
                      } else {
                        setSelectedMembers([...selectedMembers, user.id]);
                      }
                    }}
                  >
                    <Checkbox
                      checked={selectedMembers.includes(user.id)}
                      onCheckedChange={() => {}}
                    />
                    <Avatar className="w-8 h-8">
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.name}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onClose} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCreate} className="flex-1" disabled={loading}>
            {loading ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
