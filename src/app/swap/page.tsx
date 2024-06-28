import React from "react";
import SwapBox from "./components/SwapBox";
import Header from "@/components/header/Header";

const styles = {
  wrapper: `relative w-full h-screen flex flex-col items-center`,
  shapeWrapper: `absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-fit flex`,
  bgShapeOne: `bg-shape1 bg-[#FFA62F] bg-blur`,
  bgShapeTwo: `bg-shape2 bg-[#874CCC] bg-blur`,
};

const Swap = () => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.shapeWrapper}>
        <div className={styles.bgShapeOne}></div>
        <div className={styles.bgShapeTwo}></div>
      </div>
      <Header />
      <SwapBox />
    </div>
  );
};

export default Swap;
