import logo from "../../../public/epigram_image/ic_epigram.svg";
import LoginButton from "./LoginButton";
import styles from "./Header.module.css";
import Image from "next/image";
import Link from "next/link";
import FeedButton from "./FeedButton";

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContainer}>
        <Link href="/">
          <Image src={logo} alt="logo" className={styles.logoImage}/>
        </Link>
        <div>
          <FeedButton/>
        </div>
        <div className={styles["login-button"]}>
          <LoginButton />
        </div>
      </div>
    </header>
  );
};

export default Header;