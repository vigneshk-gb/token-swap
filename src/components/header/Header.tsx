"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";

import { BsThreeDots } from "react-icons/bs";
import { IoWalletOutline } from "react-icons/io5";

import ClipLoader from "react-spinners/ClipLoader";

import tokenSwapLogo from "../../../public/icons/tokenswap.svg";
import ProfileIcon from "../ProfileIcon";
import { formatWalletHashSmaller } from "@/utils/formater";
import { useTokenSwapContext } from "@/context/token-swap-context";

const styles = {
  header: `w-10/12 h-fit mt-[8px] px-[20px] flex items-center justify-between rounded-3xl bg-[#2C2D51]`,
  leftCtn: `w-fit flex gap-5 items-center`,
  logoCtn: `cursor-pointer py-[5px]`,
  menuItem: `text-[16px] text-[#BCBED5] hover:text-[#949BE0] font-medium leading-normal px-[20px] py-[5px] rounded-xl hover:bg-[#313258] cursor-pointer transition-all ease-in-out duration-200`,
  walletInfo: `w-fit flex gap-5 items-center`,
  walletAddress: `text-[14px] text-[#fff] hover:text-[#949BE0] font-medium leading-normal cursor-default transition-all ease-in-out duration-200`,
  connectBtn: `flex items-center gap-3 px-[10px] py-[5px] text-[14px] text-[#BCBED5] hover:text-[#949BE0] font-medium leading-normal text-center px-[20px] py-[5px] rounded-md bg-[#1C1E2F]  cursor-pointer transition-all ease-in-out duration-200 drop-shadow-2xl`,
};

const Header = () => {
  const { accounts, createSigningManager, signingManager, sdk } =
    useTokenSwapContext();
  const [address, setAddress] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (accounts) {
      setAddress(accounts[0]);
    }
  }, [accounts]);

  useEffect(() => {
    console.log(signingManager, ".");
  }, [signingManager]);

  //connect wallet
  const connectWalletToPolymesh = async () => {
    try {
      if (!accounts) {
        setIsLoading(true);
        createSigningManager();
      }
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.leftCtn}>
        <Link href="/" className={styles.logoCtn}>
          <Image src={tokenSwapLogo} alt="token-swap-logo" width={19.84} />
        </Link>
        <Link href="/" className={styles.menuItem}>
          Home
        </Link>
        <Link href="/swap" className={styles.menuItem}>
          Swap
        </Link>
      </div>
      <div className={styles.walletInfo}>
        {!address ? (
          <div className={styles.connectBtn} onClick={connectWalletToPolymesh}>
            {isLoading ? (
              <ClipLoader
                color="#949BE0"
                loading={isLoading}
                size={25}
                aria-label="Loading Spinner"
                data-testid="loader"
              />
            ) : (
              <>
                <IoWalletOutline size={20} />
                <span>Connect</span>
              </>
            )}
          </div>
        ) : (
          <>
            <ProfileIcon />
            <span className={styles.walletAddress}>
              {formatWalletHashSmaller(
                "5CV4DzBZnkrP1Sr86vVcogaJoVb8jMDiHyjjL3i62vjWwWr9"
              )}
            </span>
          </>
        )}
        <BsThreeDots size={20} className="cursor-pointer" />
      </div>
    </div>
  );
};

export default Header;
