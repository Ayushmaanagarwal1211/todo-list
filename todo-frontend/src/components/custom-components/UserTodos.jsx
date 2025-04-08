import React from "react";
import { auth } from "@clerk/nextjs/server";
import dynamic from "next/dynamic";
const TodosWrapper = dynamic(() => import("./TodosWrapper"));
export default async function UserTodos() {
  const { userId, getToken } = await auth();
  if (!userId) {
    return <div>Please log in to view your todos.</div>;
  }
  const token = await getToken();
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/todo?page=1`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Cache-Control": "no-cache",
      Pragma: "no-cache",
      Expires: "0",
    },
    cache: "no-store",
  });
  let data = await res.json();

  return (
    <div>
      <TodosWrapper data={data} token={token} />
    </div>
  );
}
