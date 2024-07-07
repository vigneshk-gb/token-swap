"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

import { ethers } from "ethers";

import { IoIosSwitch } from "react-icons/io";
import { MdOutlineRefresh } from "react-icons/md";
import { CiSettings } from "react-icons/ci";
import { RiArrowDropDownLine } from "react-icons/ri";
import { CiWallet } from "react-icons/ci";
import { FaArrowDownLong } from "react-icons/fa6";

import ethLogo from "../../../../public/icons/eth.png";
import usdcLogo from "../../../../public/icons/usdc.png";
import polyxLogo from "../../../../public/icons/polyx.png";

import contractAbi from "../../../lib/token-swap.json";
import { useTokenSwapContext } from "@/context/token-swap-context";

const styles = {
  container: `relative w-full max-w-[500px] h-fit min-h-[500px] mt-[100px] mx-auto flex flex-col items-center gap-3 z-10`,
  arrowCtn: `bg-[#1C1E2F] rounded-lg p-2 drop-shadow-2xl absolute top-[52%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 cursor-pointer hover:rotate-180 transition-all ease-in-out duration-500`,
  topCtn: `w-full h-fit flex items-center justify-between`,
  fromCtn: `w-full h-fit min-h-[200px] bg-[#2C2D51] rounded-3xl p-[18px] flex flex-col gap-6 z-10 bg-opacity-70`,
  InnerTopCtn: `w-full h-fit flex items-center justify-between`,
  InnerMiddleCtn: `w-full h-fit`,
  InnerSecondLastCtn: `w-full h-fit flex items-center justify-end`,
  InnerBottomCtn: `w-full flex items-center justify-between gap-3`,
  tickerBalanceCtn: `w-fit h-fit flex items-center gap-2 px-[10px] py-[5px]`,
  activeTicker: `text-[12px] text-[#949BE0] hover:text-[#BCBED5] cursor-default font-medium leading-normal text-center transition-all ease-in-out duration-200 drop-shadow-2xl`,
  percentItem: `flex-1 text-[14px] text-[#BCBED5] hover:text-[#949BE0] font-medium leading-normal text-center px-[20px] py-[5px] rounded-md bg-[#1C1E2F]  cursor-pointer transition-all ease-in-out duration-100 drop-shadow-2xl`,
  inputWrapper: `flex items-center justify-between gap-5`,
  inputBox: `w-2/3 text-[30px] text-[#FFF] placeholder:text-[#FFF] font-semibold leading-normal bg-transparent text-clip appearance-none outline-none border-none shadow-none p-0 m-0`,
  dropdown: `flex-1 relative`,
  dropdownMenu: `absolute w-full left-0 top-10 bg-[#1C1E2F] rounded-xl transition-all ease-in-out duration-200`,
  dropdownActiveItem: `flex items-center justify-between gap-1 text-[14px] text-[#BCBED5] hover:text-[#949BE0]  font-medium leading-normal px-[20px] py-[5px] rounded-xl bg-[#1C1E2F] cursor-pointer transition-all fade-in duration-100 drop-shadow-2xl`,
  dropdownItem: `w-full text-[14px] text-[#BCBED5] hover:text-[#949BE0] font-medium leading-normal text-left px-[20px] py-[5px] rounded-xl hover:bg-[#2C2D51] cursor-pointer transition-all ease-in-out duration-200`,
  tickersLogoCtn: `w-fit flex gap-3`,
  label: `text-[14px] text-[#AAB3FF] font-semibold leading-normal `,
  toCtn: `w-full h-fit min-h-[200px] bg-[#2C2D51] rounded-3xl p-[18px] flex flex-col gap-6 z-10 bg-opacity-70`,
  primaryBtn: `w-1/2 min-w-fit h-fit text-[14px] text-[#BCBED5] hover:text-[#949BE0] font-bold leading-normal text-center px-[20px] py-[10px] rounded-md bg-[#1C1E2F]  cursor-pointer transition-all ease-in-out duration-100 drop-shadow-2xl`,
};

const SwapBox = () => {
  const { signingManagerMetamask } = useTokenSwapContext();

  const [isFromOpen, setIsFromOpen] = useState<boolean>(false);
  const [isToOpen, setIsToOpen] = useState<boolean>(false);

  const [selectedIndexFrom, setSelectedIndexFrom] = useState<number>(0);
  const [selectedIndexTo, setSelectedIndexTo] = useState<number>(0);

  const [fromAmount, setFromAmount] = useState<string | null>(null);
  const [toAmount, setToAmount] = useState<string | null>(null);

  const fromDropDownRef = useRef<HTMLDivElement>(null);
  const toDropDownRef = useRef<HTMLDivElement>(null);

  const toggleIsFromOpen = () => {
    setIsFromOpen((prev) => !prev);
  };

  const toggleIsToOpen = () => {
    setIsToOpen((prev) => !prev);
  };

  const handleFromDropDownSelect = (index: number) => {
    setSelectedIndexFrom(index);
    setIsFromOpen(false);
  };

  const handleToDropDownSelect = (index: number) => {
    setSelectedIndexTo(index);
    setIsToOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fromDropDownRef.current &&
        !fromDropDownRef.current.contains(event.target as Node)
      ) {
        setIsFromOpen(false);
      }
    };

    // Attach the event listener to the document
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component is unmounted
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        toDropDownRef.current &&
        !toDropDownRef.current.contains(event.target as Node)
      ) {
        setIsToOpen(false);
      }
    };

    // Attach the event listener to the document
    document.addEventListener("click", handleClickOutside);

    // Clean up the event listener when the component is unmounted
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const tickers = ["ETH", "USDC", "PolyX"];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    const { value } = e.target;
    const normalizedValue = value.replace(",", ".");
    const regex = /^[0-9]*[.,]?[0-9]*$/;

    const setAmount = (setter: (value: string) => void) => {
      if (normalizedValue.endsWith(".")) {
        if (normalizedValue.indexOf(".") !== normalizedValue.lastIndexOf("."))
          return;
        setter(normalizedValue);
      } else if (regex.test(normalizedValue) || normalizedValue === "") {
        setter(normalizedValue);
      }
    };

    if (field === "from") {
      setAmount(setFromAmount);
    } else if (field === "to") {
      setAmount(setToAmount);
    }
  };

  //web3
  const burnTokens = async () => {
    try {
      //@ts-ignore

      const provider = new ethers.BrowserProvider(window.ethereum, {
        chainId: 11155111, // Sepolia's chain ID
        name: "sepolia",
      });
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();

      const contractAddress = "0x003A422d4aF90C9bD4Ef147634D144B5DB168183";
      const tokensContract = new ethers.Contract(
        contractAddress,
        contractAbi,
        signer
      );

      const address = await signer.getAddress();

      console.log(tokensContract, "tokensContract");
      console.log(address, "address");
      // Call the burn function with a specified gas limit
      const tx = await tokensContract.burn(fromAmount, address, {
        gasLimit: 300000, // Set an appropriate gas limit
      });
      console.log("Transaction sent:", tx);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log("Transaction mined:", receipt);
    } catch (error) {
      console.error("Error burning tokens:", error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topCtn}>
        <IoIosSwitch size={25} />
        <div className="flex gap-2">
          <MdOutlineRefresh size={25} />
          <CiSettings size={25} />
        </div>
      </div>
      <div className={styles.fromCtn}>
        <div className={styles.InnerTopCtn}>
          <span className={styles.label}>From</span>
          <div className={styles.tickersLogoCtn}>
            <Image
              src={ethLogo}
              alt="ethLogo"
              width={22}
              height={22}
              className="cursor-pointer"
              onClick={() => setSelectedIndexFrom(0)}
            />
            <Image
              src={usdcLogo}
              alt="usdclogo"
              width={22}
              height={22}
              className="cursor-pointer"
              onClick={() => setSelectedIndexFrom(1)}
            />
            <Image
              src={polyxLogo}
              alt="polyxLogo"
              width={22}
              height={22}
              className="cursor-pointer"
              onClick={() => setSelectedIndexFrom(2)}
            />
          </div>
        </div>
        <div className={styles.InnerMiddleCtn}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="0.00"
              className={styles.inputBox}
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              title="Please enter a valid number"
              onChange={(e) => handleChange(e, "from")}
              value={fromAmount || ""}
            />
            <div className={styles.dropdown} ref={fromDropDownRef}>
              <div
                className={styles.dropdownActiveItem}
                onClick={toggleIsFromOpen}
              >
                <span>{tickers[selectedIndexFrom]}</span>
                <RiArrowDropDownLine
                  size={25}
                  className={`${isFromOpen ? "rotate-180" : ""}`}
                />
              </div>
              <ul
                className={`${styles.dropdownMenu} ${
                  isFromOpen ? "block z-10" : "hidden"
                }`}
              >
                {tickers.map((el, i) => (
                  <li
                    className={styles.dropdownItem}
                    onClick={() => handleFromDropDownSelect(i)}
                    key={i}
                  >
                    {el}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.InnerSecondLastCtn}>
          <div className={styles.tickerBalanceCtn}>
            <CiWallet size={22} />
            <div className={styles.activeTicker}>
              {tickers[selectedIndexFrom]}
            </div>
          </div>
        </div>
        <div className={styles.InnerBottomCtn}>
          <div className={styles.percentItem}>25%</div>
          <div className={styles.percentItem}>50%</div>
          <div className={styles.percentItem}>75%</div>
          <div className={styles.percentItem}>100%</div>
        </div>
      </div>
      <div className={styles.arrowCtn}>
        <FaArrowDownLong size={15} />
      </div>
      <div className={styles.toCtn}>
        <div className={styles.InnerTopCtn}>
          <span className={styles.label}>To</span>
          <div className={styles.tickersLogoCtn}>
            <Image
              src={ethLogo}
              alt="ethLogo"
              width={22}
              height={22}
              className="cursor-pointer"
              onClick={() => setSelectedIndexTo(0)}
            />
            <Image
              src={usdcLogo}
              alt="usdclogo"
              width={22}
              height={22}
              className="cursor-pointer"
              onClick={() => setSelectedIndexTo(1)}
            />
            <Image
              src={polyxLogo}
              alt="polyxLogo"
              width={22}
              height={22}
              className="cursor-pointer"
              onClick={() => setSelectedIndexTo(2)}
            />
          </div>
        </div>

        <div className={styles.InnerMiddleCtn}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              placeholder="0.00"
              className={styles.inputBox}
              inputMode="decimal"
              pattern="^[0-9]*[.,]?[0-9]*$"
              title="Please enter a valid number"
              onChange={(e) => handleChange(e, "to")}
              value={toAmount || ""}
            />
            <div className={styles.dropdown} ref={toDropDownRef}>
              <div
                className={styles.dropdownActiveItem}
                onClick={toggleIsToOpen}
              >
                <span>{tickers[selectedIndexTo]}</span>
                <RiArrowDropDownLine
                  size={25}
                  className={`${isToOpen ? "rotate-180" : ""}`}
                />
              </div>
              <ul
                className={`${styles.dropdownMenu} ${
                  isToOpen ? "block z-10" : "hidden"
                }`}
              >
                {tickers.map((el, i) => (
                  <li
                    className={styles.dropdownItem}
                    onClick={() => handleToDropDownSelect(i)}
                    key={i}
                  >
                    {el}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className={styles.InnerSecondLastCtn}>
          <div className={styles.tickerBalanceCtn}>
            <CiWallet size={22} />
            <div className={styles.activeTicker}>
              {tickers[selectedIndexTo]}
            </div>
          </div>
        </div>
      </div>

      <button className={styles.primaryBtn} onClick={burnTokens}>
        Burn
      </button>
    </div>
  );
};

export default SwapBox;
