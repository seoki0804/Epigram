"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./FeedButton.module.css";

const FeedButton = () => {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    setToken(accessToken);
  }, []);

  const link = token ? "/epigramlist" : "/login";

  return (
    <Link href={link} className={styles["feed-button"]}>
      피드
    </Link>
  );
};

export default FeedButton;