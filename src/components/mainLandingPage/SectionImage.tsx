import React from "react";
import Image from "next/image";
import sectionImage1 from "../../../public/epigram_image/img_mobile_landing01.png";
import sectionImage2 from "../../../public//epigram_image/img_mobile_landing02.png";
import sectionImage3 from "../../../public//epigram_image/img_mobile_landing03.png";
import sectionImage4 from "../../../public//epigram_image/img_mobile_landing04.png";
import styles from "./SectionImage.module.css";

const SectionImage = () => {
  return (
    <div className={styles["section-container"]}>
      {/* 첫 번째 섹션 */}
      <section className={`${styles.section}`}>
        <div className={styles["section-text"]}>
          <h2 className={styles["section-heading"]}>
          명언이나 글귀, 
          토막 상식들을 공유해 보세요.
          </h2>
          <p className={styles["section-description"]}>
          나만 알던 소중한 글들을
          다른 사람들에게 전파하세요.
          </p>
        </div>
        <Image
          src={sectionImage1}
          alt="Section Image 1"
          className={styles["section-image"]}
          width={550}
          height={450}
        />
      </section>

      {/* 두 번째 섹션 */}
      <section className={`${styles.section}`}>
        <Image
          src={sectionImage2}
          alt="Section Image 2"
          className={styles["section-image"]}
          width={550}
          height={450}
        />
        <div className={styles["section-text"]}>
          <h2 className={styles["section-heading"]}>
          감정 상태에 따라,
          알맞은 위로를 받을 수 있어요.
          </h2>
          <p className={styles["section-description"]}>
          태그를 통해 글을 모아 볼 수 있어요.
          </p>
        </div>
      </section>

      {/* 세 번째 섹션 */}
      <section className={`${styles.section}`}>
        <div className={styles["section-text"]}>
          <h2 className={styles["section-heading"]}>
          내가 요즘 어떤 감정 상태인지
          통계로 한눈에 볼 수 있어요.
          </h2>
          <p className={styles["section-description"]}>
          감정 달력으로
          내 마음에 담긴 감정을 확인해보세요
          </p>
        </div>
        <Image
          src={sectionImage3}
          alt="Section Image 3"
          className={styles["section-image"]}
          width={550}
          height={450}
        />
      </section>

      {/* 네 번째 섹션 */}
      <section className={`${styles.section}`}>
      <div className={styles["section-text"]}>
          <h2 className={styles["section-heading"]}>
          사용자들이 직접
          인용한 에피그램들
          </h2>
        <Image
          src={sectionImage4}
          alt="Section Image 4"
          className={styles["section-image"]}
          width={550}
          height={450}
        />
        </div>
      </section>
    </div>
  );
};

export default SectionImage;