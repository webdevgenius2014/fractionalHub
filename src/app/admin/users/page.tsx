"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { formatDate, getInitials } from "@/lib/utils";
import { Search, UserCheck, UserX } from "lucide-react";
import type { User } from "@/types/database";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const supabase = createClient();

  useEffect(() => {
    fetchUsers();
  }, [typeFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    let query = supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (typeFilter !== "all") {
      query = query.eq("user_type", typeFilter);
    }

    const { data } = await query;
    setUsers((data as unknown as User[]) ?? []);
    setLoading(false);
  };

  const handleVerifyEmail = async (userId: string, verified: boolean) => {
    await supabase
      .from("users")
      .update({ is_email_verified: verified })
      .eq("id", userId);
    await fetchUsers();
  };

  const filtered = users.filter((u) =>
    search === "" ||
    `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const typeColors = {
    candidate: "info",
    company: "default",
    admin: "destructive",
  } as const;

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">{users.length} total users</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="candidate">Executives</SelectItem>
            <SelectItem value="company">Companies</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-muted rounded animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No users found.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => (
            <Card key={user.id}>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={user.profile_photo_url} />
                    <AvatarFallback className="text-sm">
                      {getInitials(user.first_name, user.last_name)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{user.first_name} {user.last_name}</p>
                      <Badge variant={typeColors[user.user_type] ?? "outline"}>
                        {user.user_type}
                      </Badge>
                      {user.is_email_verified ? (
                        <Badge variant="success" className="gap-1 text-xs">
                          <UserCheck className="h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-xs">Unverified</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Joined {formatDate(user.created_at)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {!user.is_email_verified ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => handleVerifyEmail(user.id, true)}
                      >
                        <UserCheck className="h-3 w-3" /> Verify
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="gap-1 text-muted-foreground"
                        onClick={() => handleVerifyEmail(user.id, false)}
                      >
                        <UserX className="h-3 w-3" /> Unverify
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
