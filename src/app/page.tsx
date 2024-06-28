import Header from "@/components/header/Header";

const styles = {
  wrapper: `w-full h-screen flex flex-col items-center`,
};

export default function Home() {
  return (
    <main className={styles.wrapper}>
      <Header />
    </main>
  );
}
