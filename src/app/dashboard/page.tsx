import React, { useEffect, useState } from "react";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { redirect } from "next/navigation";

const Dashboard = async () => {
  //INFO: How to get values from Kinde
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  //INFO: Eventual consistency.
  if (!user || !user.id) redirect("/auth-callback?origin=dashboard");

  return <div>{user?.email}</div>;
};

export default Dashboard;
