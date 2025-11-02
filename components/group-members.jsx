"use client";

import { useState } from "react";
import { useConvexQuery, useConvexMutation } from "@/hooks/use-convex-query";
import { api } from "@/convex/_generated/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, UserMinus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function GroupMembers({ members, groupId, isAdmin }) {
  const { data: currentUser } = useConvexQuery(api.users.getCurrentUser);
  const { data: availableUsers } = useConvexQuery(
    api.groups.getAvailableUsersForGroup,
    isAdmin ? { groupId } : "skip"
  );
  const addMember = useConvexMutation(api.groups.addGroupMember);
  const removeMember = useConvexMutation(api.groups.removeGroupMember);
  
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [memberToRemove, setMemberToRemove] = useState(null);

  const filteredUsers = availableUsers?.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddMember = async (userId) => {
    try {
      await addMember.mutate({ groupId, userId });
      toast.success("Member added successfully");
      setSearchQuery("");
      setShowAddDialog(false);
    } catch (error) {
      toast.error(error.message || "Failed to add member");
    }
  };

  const handleRemoveMember = async () => {
    if (!memberToRemove) return;

    try {
      await removeMember.mutate({ groupId, userId: memberToRemove.id });
      toast.success("Member removed successfully");
      setMemberToRemove(null);
    } catch (error) {
      toast.error(error.message || "Failed to remove member");
    }
  };

  if (!members || members.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        No members in this group
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {members.map((member) => {
          const isCurrentUser = member.id === currentUser?._id;
          const isMemberAdmin = member.role === "admin";
          const canRemove = isAdmin && !isCurrentUser && !isMemberAdmin;

          return (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.imageUrl} />
                  <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">
                      {isCurrentUser ? "You" : member.name}
                    </span>
                  </div>
                  {isMemberAdmin && (
                    <span className="text-xs text-muted-foreground">Admin</span>
                  )}
                </div>
              </div>
              
              {canRemove && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-100"
                  onClick={() => setMemberToRemove(member)}
                >
                  <UserMinus className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
        
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => setShowAddDialog(true)}
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        )}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Group Member</DialogTitle>
            <DialogDescription>
              Search and select a user to add to this group.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 border rounded-md px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-0 p-0 focus-visible:ring-0"
              />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              {filteredUsers && filteredUsers.length > 0 ? (
                <div className="p-2 space-y-1">
                  {filteredUsers.map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAddMember(user.id)}
                      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-muted transition-colors text-left"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.imageUrl} />
                        <AvatarFallback>
                          {user.name?.charAt(0) || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                      <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  {searchQuery
                    ? "No users found matching your search"
                    : "No available users to add"}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowAddDialog(false);
              setSearchQuery("");
            }}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Member Dialog */}
      <Dialog open={!!memberToRemove} onOpenChange={() => setMemberToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{memberToRemove?.name}</strong> from this group?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMemberToRemove(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemoveMember}>
              Remove Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
