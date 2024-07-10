"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ethers } from "ethers";

import { BsThreeDots } from "react-icons/bs";
import { IoWalletOutline } from "react-icons/io5";
import { TbWalletOff } from "react-icons/tb";

import ClipLoader from "react-spinners/ClipLoader";

import tokenSwapLogo from "../../../public/icons/tokenswap.svg";
import metamaskLogo from "../../../public/icons/metamask.png";
import POLYXLogo from "../../../public/icons/POLYX.png";

import ProfileIcon from "../ProfileIcon";
import { formatWalletHashSmaller } from "@/utils/formater";
import { useTokenSwapContext } from "@/context/token-swap-context";

const styles = {
  header: `w-10/12 h-fit mt-[8px] px-[20px] flex items-center justify-between rounded-3xl bg-[#2C2D51]`,
  leftCtn: `w-fit flex gap-5 items-center`,
  logoCtn: `cursor-pointer py-[5px]`,
  menuItem: `text-[16px] text-[#BCBED5] hover:text-[#949BE0] font-medium leading-normal px-[20px] py-[5px] rounded-xl hover:bg-[#313258] cursor-pointer transition-all ease-in-out duration-200`,
  walletContainer: `w-fit flex gap-5 items-center`,
  walletInfo: `relative flex items-center gap-3`,
  walletAddress: `text-[14px] text-[#fff] hover:text-[#949BE0] font-medium leading-normal cursor-default transition-all ease-in-out duration-200`,
  connectBtn: `flex items-center gap-3 text-[14px] text-[#BCBED5] hover:text-[#949BE0] font-medium leading-normal text-center px-[20px] py-[5px] rounded-md bg-[#1C1E2F]  cursor-pointer transition-all ease-in-out duration-200 drop-shadow-2xl`,
  walletList: `absolute top-10 left-0  w-fit h-fit px-[20px] py-[5px] flex flex-col gap-5 items-center justify-center bg-[#2C2D51] bg-opacity-50 rounded-md`,
  walletItem: `w-fit h-fit flex items-center justify-center gap-2 rounded-md text-[14px] text-[#BCBED5] hover:text-[#949BE0] cursor-pointer transition-all ease-in-out duration-200 drop-shadow-2xl`,
};

const Header = () => {
  const {
    accounts,
    createSigningManager,
    setSigningManager,
    signingManagerMetamask,
    setSigningManagerMetamask,
    address,
    setAddress,
    isLoadingPolymesh,
    setIsLoadingPolymesh
  } = useTokenSwapContext();

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (accounts) {
      setAddress(accounts[0]);
      localStorage.setItem("walletAddress", accounts[0]);
    }
  }, [accounts]);

  //connect wallet
  const connectWalletToPolymesh = async () => {
    if (address) return;
    setIsLoadingPolymesh(true);
    try {
      createSigningManager();
    } catch (error) {
      setIsLoadingPolymesh(false);
      console.log(error);
    }
  };

  const connectWalletToMetamask = async () => {
    if (address) return;
    setIsLoading(true);
    try {
      //@ts-ignore
      const provider = new ethers.BrowserProvider(window.ethereum, {
        chainId: 11155111, // Sepolia's chain ID
        name: "sepolia",
      });
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      setSigningManagerMetamask(signer);
      const userAddress = await signer.getAddress();
      setAddress(userAddress);
      localStorage.setItem("walletAddress", userAddress);
      console.log("Connected to Sepolia network");
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error);
    }
  };

  useEffect(() => {
    const savedAddress = localStorage.getItem("walletAddress");
    if (savedAddress) {
      setAddress(savedAddress);
      if (savedAddress.startsWith("0x") && savedAddress.length === 42) {
        connectWalletToMetamask();
      } else {
        connectWalletToPolymesh();
      }
    } else if (address) {
      setAddress(address);
    }

    return () => {
      setAddress(null);
      setSigningManager(undefined);
    };
  }, []);

  const disconnectWallet = () => {
    setAddress(null);
    setSigningManager(undefined);
    localStorage.removeItem("walletAddress");
  };

  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length > 0) {
        //@ts-ignore
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner(accounts[0]);
        const newAddress = await signer.getAddress();
        setSigningManagerMetamask(signer);
        setAddress(newAddress);

        console.log("Switched to Account:", newAddress);
      } else {
        console.log("Please connect to MetaMask.");
      }
    };
    //@ts-ignore

    window.ethereum.on("accountsChanged", handleAccountsChanged);

    // Cleanup the event listener on component unmount
    return () => {
      //@ts-ignore
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

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

      <div className={styles.walletContainer}>
        {isLoadingPolymesh ? (
          <div className={styles.connectBtn}>
            <ClipLoader
              color="#949BE0"
              size={25}
              aria-label="Loading Spinner"
              data-testid="loader"
            />
          </div>
        ) : !address ? (
          <details className={styles.walletInfo}>
            <summary className={styles.connectBtn}>
              <IoWalletOutline size={20} />
              <span>Connect</span>
            </summary>

            <div className={styles.walletList}>
              {/* <div
                className={styles.walletItem}
                onClick={connectWalletToMetamask}
              >
                <Image
                  src={metamaskLogo}
                  alt="Metamask Logo"
                  width={22}
                  height={22}
                  className="cursor-pointer"
                />
                Metamask
              </div> */}
              <div
                className={styles.walletItem}
                onClick={connectWalletToPolymesh}
              >
                <Image
                  src={POLYXLogo}
                  alt="Polkadot Logo"
                  width={22}
                  height={22}
                  className="cursor-pointer"
                />
                Polkadot
              </div>
            </div>
          </details>
        ) : (
          <div className={styles.walletInfo}>
            <ProfileIcon />
            <span className={styles.walletAddress}>
              {formatWalletHashSmaller(address ? address : "")}
            </span>
            <TbWalletOff size={25} onClick={disconnectWallet} color="#949BE0" />
          </div>
        )}

        <BsThreeDots size={20} className="cursor-pointer" />
      </div>
    </div>
  );
};

export default Header;
