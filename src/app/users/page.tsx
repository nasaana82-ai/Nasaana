"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type User = {
  id: number;
  email: string;
  name: string | null;
  createdAt: string;
};

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/api/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

async function createUser(data: { email: string; name: string }) {
  const res = await fetch("/api/users", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create user");
  return res.json();
}

export default function UsersPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const mutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setEmail("");
      setName("");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    mutation.mutate({ email, name });
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Шинэ хэрэглэгч нэмэх</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Имэйл</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jargal@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Нэр</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Жаргал"
              />
            </div>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Нэмж байна..." : "Нэмэх"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Хэрэглэгчдийн жагсаалт</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Ачааллаж байна...</p>}
          {isError && <p className="text-red-500">Алдаа гарлаа.</p>}
          {users && users.length === 0 && <p>Хэрэглэгч алга байна.</p>}
          <ul className="space-y-2">
            {users?.map((u) => (
              <li
                key={u.id}
                className="border rounded-md p-3 flex justify-between"
              >
                <span>{u.name || "(нэргүй)"}</span>
                <span className="text-muted-foreground">{u.email}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}