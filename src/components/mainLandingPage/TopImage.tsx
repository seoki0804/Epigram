import React from "react";
import styles from "./TopImage.module.css";

const TopImage = () => {
  return (
    <section className={styles["top-image-section"]}>
      <div className={styles["text-content"]}>
        <h1 className={styles.title}>
        나만 갖고 있기엔
        아까운 글이 있지 않나요?
        <p>다른 사람들과 감정을 공유해 보세요.</p>
        </h1>

      </div>
    </section>
  );
};

export default TopImage;